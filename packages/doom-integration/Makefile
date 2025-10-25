# DOOM Blockchain Integration Makefile

# Compiler settings
CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -O2
LDFLAGS = -lcurl -ljson-c

# Directories
SRC_DIR = src
OBJ_DIR = obj
BIN_DIR = bin

# Source files
SOURCES = $(wildcard $(SRC_DIR)/*.c)
OBJECTS = $(SOURCES:$(SRC_DIR)/%.c=$(OBJ_DIR)/%.o)
TARGET = $(BIN_DIR)/doom-blockchain

# Blockchain integration files
BLOCKCHAIN_SRC = blockchain.c
BLOCKCHAIN_OBJ = $(OBJ_DIR)/blockchain.o

# Default target
all: $(TARGET)

# Create directories
$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

# Compile blockchain integration
$(BLOCKCHAIN_OBJ): $(BLOCKCHAIN_SRC) | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

# Link final executable
$(TARGET): $(OBJECTS) $(BLOCKCHAIN_OBJ) | $(BIN_DIR)
	$(CC) $(OBJECTS) $(BLOCKCHAIN_OBJ) -o $@ $(LDFLAGS)

# Compile source files
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

# Clean build artifacts
clean:
	rm -rf $(OBJ_DIR) $(BIN_DIR)

# Install dependencies
install-deps:
	sudo apt-get update
	sudo apt-get install -y libcurl4-openssl-dev libjson-c-dev build-essential

# Run with blockchain integration
run: $(TARGET)
	./$(TARGET) -blockchain -config blockchain.conf

# Debug build
debug: CFLAGS += -g -DDEBUG
debug: $(TARGET)

# Release build
release: CFLAGS += -DNDEBUG
release: $(TARGET)

# Test blockchain integration
test: $(TARGET)
	./$(TARGET) -test-blockchain

# Package for distribution
package: $(TARGET)
	mkdir -p doom-blockchain-package
	cp $(TARGET) doom-blockchain-package/
	cp blockchain.conf.example doom-blockchain-package/
	cp README.md doom-blockchain-package/
	tar -czf doom-blockchain.tar.gz doom-blockchain-package/
	rm -rf doom-blockchain-package

# Help target
help:
	@echo "DOOM Blockchain Integration Makefile"
	@echo "===================================="
	@echo ""
	@echo "Targets:"
	@echo "  all          - Build the project (default)"
	@echo "  clean        - Remove build artifacts"
	@echo "  install-deps - Install required dependencies"
	@echo "  run          - Build and run with blockchain integration"
	@echo "  debug        - Build with debug symbols"
	@echo "  release      - Build optimized release version"
	@echo "  test         - Run blockchain integration tests"
	@echo "  package      - Create distribution package"
	@echo "  help         - Show this help message"
	@echo ""
	@echo "Dependencies:"
	@echo "  - libcurl4-openssl-dev"
	@echo "  - libjson-c-dev"
	@echo "  - build-essential"
	@echo ""
	@echo "Usage:"
	@echo "  make install-deps  # Install dependencies first"
	@echo "  make            # Build the project"
	@echo "  make run        # Run with blockchain integration"

.PHONY: all clean install-deps run debug release test package help
