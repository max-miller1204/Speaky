{
  description = "Speaky - A free, open source, and extensible speech-to-text application";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    supportedSystems = ["x86_64-linux"];
    forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    # Read version from Cargo.toml
    cargoToml = builtins.fromTOML (builtins.readFile ./src-tauri/Cargo.toml);
    version = cargoToml.package.version;
  in {
    packages = forAllSystems (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      # AppImage-based package
      speaky-appimage = let
        appimage = pkgs.appimageTools.wrapType2 {
          pname = "speaky-appimage-unwrapped";
          inherit version;
          src = pkgs.fetchurl {
            url = "https://github.com/max-miller1204/Speaky/releases/download/v${version}/Speaky_${version}_amd64.AppImage";
            hash = "sha256-tTswFYLCPGtMbHAb2bQMsklRiRCVXLrtu4pQC8IHdqQ=";
          };
          extraPkgs = p:
            with p; [
              alsa-lib
            ];
        };
      in
        pkgs.writeShellScriptBin "speaky" ''
          export WEBKIT_DISABLE_DMABUF_RENDERER=1
          exec ${appimage}/bin/speaky-appimage-unwrapped "$@"
        '';

      default = self.packages.${system}.speaky-appimage;
    });

    # Development shell for building from source
    devShells = forAllSystems (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          # Rust
          rustc
          cargo
          rust-analyzer
          clippy
          # Frontend
          nodejs
          bun
          # Tauri CLI
          cargo-tauri
          # Native deps
          pkg-config
          openssl
          alsa-lib
          libsoup_3
          webkitgtk_4_1
          gtk3
          glib
          libxtst
          libevdev
          llvmPackages.libclang
          cmake
          vulkan-headers
          vulkan-loader
          shaderc
          libappindicator
        ];

        LIBCLANG_PATH = "${pkgs.llvmPackages.libclang.lib}/lib";
        LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.libappindicator ]}";

        shellHook = ''
          echo "Speaky development environment"
          bun install
          echo "Run 'bun run tauri dev' to start"
        '';
      };
    });
  };
}
