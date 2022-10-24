FROM python:3

RUN apt-get install curl -y

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -

RUN apt-get update

RUN apt-get install nodejs -y

RUN pip install poetry

RUN corepack enable

RUN corepack prepare pnpm@latest --activate

RUN apt-get install -y openjdk-17-jre

WORKDIR /usr/src/app

RUN mkdir -p backend/matchedpotato frontend/dist

COPY backend/poetry.lock backend/pyproject.toml backend/

COPY backend/matchedpotato/__init__.py backend/matchedpotato/

RUN cd backend && poetry install

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/

RUN cd frontend && pnpm install

COPY . .

RUN bash generate-api.sh

RUN cd frontend && pnpm build

RUN apt-get remove -y --purge curl nodejs openjdk-17-jre && apt-get clean

RUN rm -rf /usr/lib/jvm ~/.local/share/pnpm && cd frontend && rm -rf node_modules

CMD cd backend && poetry run python -m matchedpotato.api

