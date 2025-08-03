import React from 'react';
import GameBoard from './components/board/GameBoard';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Unus Venditor</h1>
        <p>The Game of One Seller</p>
      </header>
      <main>
        <GameBoard />
      </main>
    </div>
  );
}

export default App;