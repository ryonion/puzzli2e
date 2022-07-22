import { useState, useRef, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import PuzzleImage from "./puzzleImage";
import { Piece } from "./Piece";
import Konva from "konva";

const ROWS = 5;
const COLS = 5;
const Playground = {
  width: Math.min(window.innerWidth, 400 + 100),
  height: Math.min(window.innerWidth, 400 + 100),
};

const Board = () => {
  const [pieces, setPieces] = useState([]);
  const stageRef = useRef(null);
  const [pieceLayer, setPieceLayer] = useState(null);

  const initializePieces = () => {
    const updatedPieces = [];
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        updatedPieces.push(new Piece(i, j, ROWS, COLS, Playground.width, Playground.height));
      }
    }
    setPieces(updatedPieces);
  };

  const moveToRandomPos = (konvaShape) => {
    const loc = {
      x: Math.random() * (Playground.width - konvaShape.width()),
      y: Math.random() * (Playground.height - konvaShape.height()),
    };
    konvaShape.position(loc);
  };

  const getScaledPointerPos = (loc) => {
    return {
      x: loc.x - stageRef.current.x(),
      y: loc.y - stageRef.current.y(),
    };
  };

  const inBound = (piece) => {
    return {
      xMin: piece.x() >= 0,
      xMax: piece.x() <= Playground.width - piece.width(),
      yMin: piece.y() >= 0,
      yMax: piece.y() <= window.innerHeight - piece.height(),
    };
  };

  const getDistance = (x1, y1, x2, y2) => {
    const y = x2 - x1;
    const x = y2 - y1;
    return Math.sqrt(x * x + y * y);
  };

  const onMouseMove = (evt, shape) => {
    if (shape) {
      evt = getScaledPointerPos(stageRef.current.getPointerPosition());
      const inBoundStatus = inBound(shape);
      let correctedX = shape.x();
      let correctedY = shape.y();
      let needCorrection = false;

      if (!inBoundStatus.xMin) {
        correctedX = 0;
        needCorrection = true;
      }

      if (!inBoundStatus.xMax) {
        correctedX = Playground.width - shape.width();
        needCorrection = true;
      }

      if (!inBoundStatus.yMin) {
        correctedY = 0;
        needCorrection = true;
      }

      if (!inBoundStatus.yMax) {
        correctedY = window.innerHeight - shape.height();
        needCorrection = true;
      }

      if (getDistance(correctedX, correctedY, shape.attrs.correctX, shape.attrs.correctY) <= (shape.width() / 3)) {
        correctedX = shape.attrs.correctX;
        correctedY = shape.attrs.correctY;
        needCorrection = true;
      }

      if (needCorrection) {
        shape.position({
          x: correctedX,
          y: correctedY,
        });
      }
    }
  };

  // ---------------- useEffect --------------------

  useEffect(() => {
    // initializePieces();
    const layer = new Konva.Layer();
    setPieceLayer(layer);
    stageRef.current.add(layer);
  }, []);

  useEffect(() => {
    if (pieces.length && pieceLayer) {
      pieceLayer.removeChildren();
      const myImg = new Image();
      myImg.src = "zelda2.png";
      myImg.onload = function() {
        for (let i = 0; i < pieces.length; i++) {
          const shape = pieces[i].getShape(this);
          moveToRandomPos(shape);
          pieceLayer.add(shape);
        }
        pieceLayer.zIndex(1);
        pieceLayer.batchDraw();
      };
    }
  }, [pieces, pieceLayer]);

  return (
    <Stage
      x={0}
      y={0}
      width={window.innerWidth}
      height={window.innerHeight}
      ref={stageRef}
      onDragMove={(e) => {
        onMouseMove(e.evt, e.target);
      }}
    >
      <Layer listening={false}>
        <PuzzleImage width={Playground.width} height={Playground.height} />
      </Layer>
    </Stage>
  );
};

export default Board;
