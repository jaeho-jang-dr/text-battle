import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter,
  Timestamp,
} from 'firebase/firestore';
import { UserDoc, CharacterDoc, BattleDoc, NPCDoc } from './collections';

function dateToTimestamp(date: Date | Timestamp): Timestamp {
  return date instanceof Date ? Timestamp.fromDate(date) : date;
}

function timestampToDate(timestamp: Timestamp | Date): Date {
  return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
}

export const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore(user: UserDoc): DocumentData {
    return {
      ...user,
      createdAt: dateToTimestamp(user.createdAt),
      updatedAt: dateToTimestamp(user.updatedAt),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): UserDoc {
    const data = snapshot.data(options);
    return {
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as UserDoc;
  },
};

export const characterConverter: FirestoreDataConverter<CharacterDoc> = {
  toFirestore(character: CharacterDoc): DocumentData {
    return {
      ...character,
      createdAt: dateToTimestamp(character.createdAt),
      updatedAt: dateToTimestamp(character.updatedAt),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CharacterDoc {
    const data = snapshot.data(options);
    return {
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as CharacterDoc;
  },
};

export const battleConverter: FirestoreDataConverter<BattleDoc> = {
  toFirestore(battle: BattleDoc): DocumentData {
    return {
      ...battle,
      createdAt: dateToTimestamp(battle.createdAt),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): BattleDoc {
    const data = snapshot.data(options);
    return {
      ...data,
      createdAt: timestampToDate(data.createdAt),
    } as BattleDoc;
  },
};

export const npcConverter: FirestoreDataConverter<NPCDoc> = {
  toFirestore(npc: NPCDoc): DocumentData {
    return {
      ...npc,
      createdAt: dateToTimestamp(npc.createdAt),
      updatedAt: dateToTimestamp(npc.updatedAt),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): NPCDoc {
    const data = snapshot.data(options);
    return {
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as NPCDoc;
  },
};