#! /usr/bin/env bash

set -euo pipefail

cd backend

poetry run python -m matchedpotato.api &

sleep 10

cd ../frontend

pnpm generate

trap 'kill $(jobs -p)' EXIT
