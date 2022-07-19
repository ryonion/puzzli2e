import { useState, useRef, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import PuzzleImage from "components/puzzle/puzzleImage";
import Konva from "konva";
import { db } from "../../firebase";
import { set, ref, push } from "firebase/database";
import { useList } from "react-firebase-hooks/database";
import { Piece } from "./Piece";

const playgroundWidth = 500;

const Playground = {
  width: Math.min(window.innerWidth, playgroundWidth),
  height: Math.min(window.innerWidth, playgroundWidth),
};

const navHeight = 56;
const checkInRowHeight = 20;
const stageOffsetX = navHeight + checkInRowHeight;

const scale = Playground.width / playgroundWidth;

// todo: apply scale, so piece size and x,y are consistent across devices
const Board = ({ planId, rows, cols }) => {
  const [pieces, setPieces] = useState(null);
  const stageRef = useRef(null);
  const [pieceLayer, setPieceLayer] = useState(null);
  const [snapshots, loading] = useList(ref(db, `pieces/${planId}`));
  const [myImage, setImage] = useState(null);
  const addPiece = (Piece) => {
    push(ref(db, `pieces/${planId}`), Piece);
  };

  // todo: save imageUrl to firebase
  const createNode = (piece, image) => {
    const scaledWidth = piece.width * scale;
    const scaledHeight = piece.height * scale;
    const shape = new Konva.Shape({
      x: piece.x * scale,
      y: piece.y * scale,
      width: scaledWidth,
      height: scaledHeight,
      correctX: piece.correctX * scale,
      correctY: piece.correctY * scale,
      id: piece.id,
      sceneFunc: (context) => {
        // todo: shorten
        context.beginPath();
        context.drawImage(image, piece.colIndex * image.naturalWidth / cols,
            piece.rowIndex * image.naturalHeight / rows,
            image.naturalWidth / cols,
            image.naturalHeight / rows, 0, 0, scaledWidth, scaledHeight);
        context.rect(0, 0, scaledWidth, scaledHeight);
        context.closePath();
        context.fillStrokeShape(shape);
      },
      draggable: true,
    });

    return shape;
  };

  const getPieces = () => {
    const pieceDict = {};
    for (const p of snapshots) {
      const piece = p.val();
      piece.id = p.key;
      if (piece.acquired) {
        const newNode = createNode(piece, myImage);
        pieceDict[p.key] = piece;
        pieceLayer.add(newNode);
        pieceLayer.zIndex(1);
        pieceLayer.batchDraw();
      }
    }
    setPieces(pieceDict);
  };

  const updatePieces = () => {
    const pieceDict = {};
    for (const p of snapshots) {
      const piece = p.val();
      if (piece.acquired) {
        const node = pieceLayer.children.find((x) => x.attrs.id === p.key);
        if (node) {
          node.x(piece.x * scale);
          node.y(piece.y * scale);
          pieceDict[p.key] = piece;
        } else {
          piece.id = p.key;
          pieceDict[p.key] = piece;
          const newNode = createNode(piece, myImage);
          pieceLayer.add(newNode);
        }
      } else {
        const node = pieceLayer.children.find((x) => x.attrs.id === p.key);
        if (node) {
          node.destroy();
        }
      }
    }
    setPieces(pieceDict);
  };

  const initializePieces = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const newPiece = new Piece(i, j, Playground.width / cols, Playground.height / rows);
        moveToRandomPos(newPiece);
        addPiece(newPiece);
      }
    }
  };

  // const moveToRandomPos = (konvaShape) => {
  //   const loc = {
  //     x: Math.random() * (Playground.width - konvaShape.width()),
  //     y: Math.random() * (Playground.height - konvaShape.height() - stageOffsetX),
  //   };
  //   konvaShape.position(loc);
  // };

  const moveToRandomPos = (piece) => {
    const loc = {
      x: Math.random() * (Playground.width - piece.width * scale),
      y: Math.random() * (Playground.height - piece.height * scale),
    };
    piece.x = loc.x;
    piece.y = loc.y;
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
      yMax: piece.y() <= window.innerHeight - piece.height() - stageOffsetX,
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
        correctedY = window.innerHeight - shape.height() - stageOffsetX;
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

  const savePiece = (piece) => {
    const pieceToSave = pieces[piece.attrs.id];
    pieceToSave.x = piece.x() / scale;
    pieceToSave.y = piece.y() / scale;
    set(ref(db, `pieces/${planId}/${piece.attrs.id}`), pieceToSave);
  };

  // ---------------- useEffect --------------------

  const loadImage = () => {
    const myImg = new Image();
    myImg.src = "zelda2.png";
    myImg.onload = function() {
      setImage(this);
    };
  };

  useEffect(() => {
    loadImage();
    // initializePieces();
    const layer = new Konva.Layer();
    setPieceLayer(layer);
    stageRef.current.add(layer);
  }, []);

  // useEffect(() => {
  //   if (pieces.length && pieceLayer) {
  //     pieceLayer.removeChildren();
  //     const myImg = new Image();
  //     myImg.src = "zelda2.png";
  //     myImg.onload = function() {
  //       for (let i = 0; i < pieces.length; i++) {
  //         const shape = pieces[i].getShape(this);
  //         moveToRandomPos(shape);
  //         pieceLayer.add(shape);
  //       }
  //       pieceLayer.zIndex(1);
  //       pieceLayer.batchDraw();
  //     };
  //   }
  // }, [pieces, pieceLayer]);

  useEffect(() => {
    if (!loading && snapshots && myImage) {
      if (!pieces) {
        getPieces();
      } else {
        updatePieces();
      }
    }
  }, [snapshots, loading, myImage]);

  return (
    <Stage
      x={0}
      y={0}
      width={Playground.width}
      height={window.innerHeight - stageOffsetX}
      ref={stageRef}
      onDragMove={(e) => {
        onMouseMove(e.evt, e.target);
      }}
      onDragEnd={(e) => {
        savePiece(e.target);
      }}
    >
      <Layer listening={false}>
        <PuzzleImage width={Playground.width} height={Playground.height} />
      </Layer>
    </Stage>
  );
};

export default Board;
