FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    ca-certificates \
    curl \
    desktop-file-utils \
    file \
    git \
    libayatana-appindicator3-dev \
    libfuse2 \
    libgtk-3-dev \
    librsvg2-dev \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    libxdo-dev \
    patchelf \
    pkg-config \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y --profile minimal --default-toolchain stable

RUN cargo install tauri-cli --version "^2" --locked

COPY build/appimage/build-appimage.sh /usr/local/bin/build-appimage
RUN chmod 755 /usr/local/bin/build-appimage

WORKDIR /work

ENTRYPOINT ["/usr/local/bin/build-appimage"]
