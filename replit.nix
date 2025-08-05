{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript-language-server
    pkgs.sqlite
    pkgs.sqlitebrowser
  ];
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.sqlite
    ];
  };
}