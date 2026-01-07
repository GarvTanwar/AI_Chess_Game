#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Download and setup Stockfish for Linux
mkdir -p stockfish
cd stockfish
wget https://github.com/official-stockfish/Stockfish/releases/download/sf_16.1/stockfish-ubuntu-x86-64-avx2.tar
tar -xvf stockfish-ubuntu-x86-64-avx2.tar
mv stockfish/stockfish-ubuntu-x86-64-avx2 stockfish-linux
chmod +x stockfish-linux
cd ..
