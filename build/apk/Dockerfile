FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    NDK_HOME=/opt/android-sdk/ndk/28.2.13676358 \
    JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
    PATH=/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:$PATH

RUN apt-get update && apt-get install -y \
    build-essential \
    ca-certificates \
    clang \
    cmake \
    curl \
    file \
    git \
    libssl-dev \
    openjdk-21-jdk-headless \
    pkg-config \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/android-sdk/cmdline-tools \
    && curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools \
    && mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

RUN yes | sdkmanager --licenses >/dev/null 2>&1 || true
RUN sdkmanager --install \
    "platform-tools" \
    "platforms;android-37.0" \
    "build-tools;36.0.0" \
    "ndk;28.2.13676358" \
    && chmod -R a+rwX /opt/android-sdk

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y --profile minimal --default-toolchain stable

RUN rustup target add \
    aarch64-linux-android \
    armv7-linux-androideabi \
    i686-linux-android \
    x86_64-linux-android

RUN cargo install tauri-cli --version "^2" --locked

COPY build/apk/build-apk.sh /usr/local/bin/build-apk
RUN chmod 755 /usr/local/bin/build-apk

WORKDIR /work

ENTRYPOINT ["/usr/local/bin/build-apk"]
