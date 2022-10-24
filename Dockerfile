FROM python:3

RUN apt-get install curl -y

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -

RUN apt-get update

RUN apt-get install nodejs -y

RUN pip install poetry

RUN corepack enable

RUN corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

RUN mkdir -p backend/matchedpotato frontend

COPY backend/poetry.lock backend/pyproject.toml backend/

COPY backend/matchedpotato/__init__.py backend/matchedpotato/

RUN cd backend && poetry install

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/

RUN cd frontend && pnpm install

COPY . .

RUN cd frontend && pnpm build

CMD cd backend && poetry run python -m matchedpotato.api
