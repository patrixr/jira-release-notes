#!/usr/bin/env bash

VERSION=`node -p "require('./package.json').version"`

git tag -a -m "JIRA Release notes action v$VERSION" "v$VERSION" && \
  git push --follow-tags