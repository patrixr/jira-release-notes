#!/usr/bin/env bash

git checkout sample_branch_head && \
  git rebase master && \
  git push origin sample_branch_head --force
  
git checkout master