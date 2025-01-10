#!/bin/bash

# Define the package name and version
PACKAGE_NAME="pinokiod"
PACKAGE_VERSION="latest"

# Check if package.json exists
if [ ! -f package.json ]; then
  # Use npm to download the package
  PACKAGE_TARBALL=$(npm pack $PACKAGE_NAME@$PACKAGE_VERSION | grep $PACKAGE_NAME | grep .tgz)

  # Extract the package
  tar -xzf $PACKAGE_TARBALL
  mv package/* .
else

  REMOVE_WHITELIST=(
    "node_modules"
    "pull.sh"
  )

  for item in "${REMOVE_WHITELIST[@]}"; do
    rm -rf "$item"
  done
  # Get the current version of the package
  CURRENT_VERSION=$(cat package.json | grep version | cut -d'"' -f4)

  # Get the new version of the package
  NEW_VERSION=$(npm view $PACKAGE_NAME@$PACKAGE_VERSION version)

  # Check if the versions are different
  if [ $CURRENT_VERSION != $NEW_VERSION ]; then
    # Use npm to download the package
    PACKAGE_TARBALL=$(npm pack $PACKAGE_NAME@$PACKAGE_VERSION | grep $PACKAGE_NAME | grep .tgz)

    # Extract the package
    tar -xzf $PACKAGE_TARBALL
    mv package/* .
  fi
fi

# Remove the package folder
rm -rf package

