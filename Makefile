# AnatoQuizUp Web — Makefile
#
# Uso: rode `make help` para ver todos os comandos.
# No Windows, instale o GNU Make antes:
#   choco install make    (Chocolatey)
#   scoop install make    (Scoop)

SHELL := /bin/sh
.DEFAULT_GOAL := help

# ============================================================================
#  Ajuda
# ============================================================================

.PHONY: help
help: ## Lista todos os comandos disponiveis
	@echo ""
	@echo "AnatoQuizUp Web - comandos disponiveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
#  Setup
# ============================================================================

.PHONY: setup
setup: ## Copia .env (se nao existir) e instala dependencias
	@if [ ! -f .env ]; then cp .env.example .env && echo "[setup] .env criado apontando para o BFF em http://localhost:4000/api/v1."; fi
	npm ci

.PHONY: install
install: ## npm ci
	npm ci

# ============================================================================
#  Desenvolvimento
# ============================================================================

.PHONY: dev
dev: ## Sobe o Vite em http://localhost:5173
	npm run dev

.PHONY: preview
preview: ## Sobe o preview da build (porta 4173)
	npm run preview

.PHONY: build
build: ## Compila para dist/
	npm run build

# ============================================================================
#  Qualidade
# ============================================================================

.PHONY: lint
lint: ## ESLint
	npm run lint

.PHONY: test
test: ## Testes Jest
	npm test

.PHONY: test-ci
test-ci: ## Testes com cobertura (gate 85%)
	npm run test:ci

# ============================================================================
#  Stack completa
# ============================================================================

.PHONY: dev-stack
dev-stack: ## Imprime instrucoes para subir Backend + BFF + Web (3 terminais)
	@echo ""
	@echo "Para rodar a stack completa, abra 3 terminais e rode:"
	@echo ""
	@echo "  Terminal 1 (Backend):"
	@echo "    cd ../2026-1-AnatoQuizUp-Backend && make dev"
	@echo ""
	@echo "  Terminal 2 (BFF):"
	@echo "    cd ../2026-1-AnatoQuizUp-API && make dev"
	@echo "    (a pasta local ainda se chama -API; remote ja aponta para -BFF no GitHub)"
	@echo ""
	@echo "  Terminal 3 (Web - aqui):"
	@echo "    make dev"
	@echo ""

# ============================================================================
#  Limpeza
# ============================================================================

.PHONY: clean
clean: ## Remove dist/, coverage/ e node_modules/
	rm -rf dist coverage node_modules
	@echo "[clean] dist/, coverage/ e node_modules/ removidos."
