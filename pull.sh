#!/bin/bash

# Define the package name and version
PACKAGE_NAME="pinokiod"
PACKAGE_VERSION="latest"

  if [ -d "pinokiod" ]; then
    find pinokiod -mindepth 1 -maxdepth 1 ! -name 'node_modules' -exec rm -rf {} +
  fi

  # Get the new version of the package
  NEW_VERSION=$(npm view $PACKAGE_NAME@$PACKAGE_VERSION version)

    # Use npm to download the package
    PACKAGE_TARBALL=$(npm pack $PACKAGE_NAME@$PACKAGE_VERSION | grep $PACKAGE_NAME | grep .tgz)

    # Extract the package to pinokiod directory
    mkdir -p pinokiod
    tar -xzf $PACKAGE_TARBALL -C pinokiod --strip-components=1
    rm $PACKAGE_TARBALL
  fi
fi

