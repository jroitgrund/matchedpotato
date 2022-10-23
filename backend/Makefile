isort-check-all:
	poetry run isort matchedpotato -c

black-check-all:
	poetry run black matchedpotato --check

flake8-check-all:
	poetry run flake8 matchedpotato

mypy-check-all:
	poetry run mypy --namespace-packages matchedpotato

check: isort-check-all black-check-all flake8-check-all mypy-check-all
