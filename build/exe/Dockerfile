FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    ca-certificates \
    clang \
    curl \
    file \
    git \
    libssl-dev \
    lld \
    llvm \
    pkg-config \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN if ! command -v llvm-rc >/dev/null 2>&1; then \
        ln -s "$(command -v llvm-rc-14 || command -v llvm-rc-15 || command -v llvm-rc-16)" /usr/local/bin/llvm-rc; \
    fi

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y --profile minimal --default-toolchain stable

RUN rustup target add x86_64-pc-windows-msvc

RUN cargo install tauri-cli --version "^2" --locked
RUN cargo install --locked cargo-xwin

COPY build/exe/build-exe.sh /usr/local/bin/build-exe
RUN chmod 755 /usr/local/bin/build-exe

WORKDIR /work

ENTRYPOINT ["/usr/local/bin/build-exe"]
