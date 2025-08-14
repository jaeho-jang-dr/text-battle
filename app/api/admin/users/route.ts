import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/admin-auth-nextauth";
import { memoryStore } from "@/lib/db/memory-store";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageLimit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * pageLimit;

    // Get all users from memory store
    const allUsers = Array.from(memoryStore.users.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    let filteredUsers = allUsers;
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = allUsers.filter(user => 
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }
    
    const totalCount = filteredUsers.length;
    
    // Paginate results
    const paginatedUsers = filteredUsers.slice(offset, offset + pageLimit);
    
    // Get character count for each user
    const users = paginatedUsers.map(user => {
      const userCharacters = Array.from(memoryStore.characters.values())
        .filter(char => char.userId === user.id);
      
      return {
        ...user,
        characters: [{ count: userCharacters.length }]
      };
    });

    return NextResponse.json({
      users,
      total: totalCount,
      page,
      limit: pageLimit,
      totalPages: Math.ceil(totalCount / pageLimit),
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
});

export const PATCH = adminOnly(async (request: NextRequest) => {
  try {
    const { userId, updates } = await request.json();

    const user = memoryStore.users.get(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    memoryStore.users.set(userId, updatedUser);

    // Log admin action
    await memoryStore.createAdminLog({
      adminId: "admin@example.com",
      action: "user_update",
      details: {
        targetId: userId,
        updates: updates
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
});

export const DELETE = adminOnly(async (request: NextRequest) => {
  try {
    const { userId } = await request.json();

    if (!memoryStore.users.has(userId)) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user and their characters
    memoryStore.users.delete(userId);
    
    // Delete user's characters
    const userCharacters = Array.from(memoryStore.characters.values())
      .filter(char => char.userId === userId);
    userCharacters.forEach(char => memoryStore.characters.delete(char.id));

    // Log admin action
    await memoryStore.createAdminLog({
      adminId: "admin@example.com",
      action: "user_delete",
      details: {
        targetId: userId,
        deletedCharacters: userCharacters.length
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
});