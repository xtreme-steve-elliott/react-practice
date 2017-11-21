import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      style={props.highlighted ? {background: 'green', color: 'white'} : null}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={"cell-" + i}
        highlighted={this.props.highlights.includes(i)}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  
  renderRow(rowNum, itemCount) {
    const square = (i) => this.renderSquare(i);
    return (
      <div className="board-row" key={"row-" + rowNum}>
        {Array.apply(0, Array(itemCount)).map((x, i) => square((rowNum * itemCount) + i))}
      </div>
    );
  }

  render() {
    const row = (i, c) => this.renderRow(i, c);
    const dimen = Math.sqrt(this.props.squares.length);
    return (
      <div>
        {Array.apply(0, Array(dimen)).map((x, i) => row(i, dimen))}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
      increasingOrder: true
    }
  }
  
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).done || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }
  
  reverseOrdering() {
    this.setState({
      increasingOrder: !this.state.increasingOrder
    });
  }
  
  render() {
    let history;
    let currIndex;
    if (this.state.increasingOrder) {
      history = this.state.history;
      currIndex = this.state.stepNumber;
    } else {
      history = this.state.history.slice(0).reverse();
      currIndex = history.length - 1 - this.state.stepNumber;
    }
    const current = history[currIndex];
    const result = calculateWinner(current.squares);
    
    const moves = history.map((step, move) => {
      let lastMove = null;
      let desc = 'Go to game start';
      let presentationNumber = move;
      if (this.state.increasingOrder) {
        if (move) {
          const prev = history[move - 1];
          const curr = history[move];
          const diff = boardDiff(curr.squares, prev.squares);
          lastMove = diff[0];
          desc = 'Go to move #' + presentationNumber;
        }
      } else {
        presentationNumber = history.length - 1 - move;
        if (move < history.length - 1) {
          const prev = history[move + 1];
          const curr = history[move];
          const diff = boardDiff(curr.squares, prev.squares);
          lastMove = diff[0];
          desc = 'Go to move #' + presentationNumber;
        }
      }
      return (
        <li key={move}>
          <button style={(move == currIndex) ?{fontWeight: 'bold'} : null} onClick={() => this.jumpTo(presentationNumber)}>{desc}</button> {(lastMove) ? "[" +lastMove.val + " at " + lastMove.pos + "]" : ""}
        </li>
      );
    });
    
    let status;
    if (result.done) {
      if (result.winner) {
        status = 'Winner: ' + result.winner;
      } else {
        status = 'Cat\'s Game';
      }
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            highlights={result.cells}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status} <button onClick={() => this.reverseOrdering()}>Sort {this.state.increasingOrder ? "Decreasing" : "Increasing"}</button></div>
          <ol start={this.state.increasingOrder ? 0 : moves.length - 1} reversed={!this.state.increasingOrder}>{moves}</ol>
        </div>
      </div>
    );
  }
}

function boardDiff(curr, prev) {
  let ret = [];
  const arrLen = curr.length;
  const dimen = Math.sqrt(arrLen);
  const horizontal = (x) => x % dimen;
  const vertical = (y) => Math.floor(y / dimen);
  for (let i = 0; i < arrLen; i++) {
    if (curr[i] != prev[i]) {
      ret.push({pos: "(" + horizontal(i) + "," + vertical(i) + ")", val: curr[i]});
    }
  }
  return ret;
}

function genLines(itemCount) {
  const dimen = Math.sqrt(itemCount);
  let ret = [];
  let diag = [];
  let revDiag = [];
  Array.apply(0, Array(dimen)).map((x, i) => {
    let row = [];
    let col = [];
    Array.apply(0, Array(dimen)).map((y, j) => {
      row.push((i * dimen) + j);
      col.push(i + (j * dimen));
      if (i == j) {
        diag.push(i + (j * dimen));
      }
      if (dimen - 1 - i == j) {
        revDiag.push((i * dimen) + j);
      }
    });
    ret.push(row);
    ret.push(col);
  });
  ret.push(diag);
  ret.push(revDiag);
  return ret;
}

function calculateWinner(squares) {
  const lines = genLines(squares.length);
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {done: true, winner: squares[a], cells: [a, b, c]};
    }
  }
  if (squares.every((item) => item != null)) {
    return {done: true, winner: null, cells: []};
  }
  return {done: false, winner: null, cells: []};
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
