import { useState, useRef, useEffect } from "react";
import { Stage } from "react-konva";
import Konva from "konva";
import { db } from "../../firebase";
import { set, ref } from "firebase/database";
import { useList, useObjectVal } from "react-firebase-hooks/database";
import { Playground, stageOffsetY, scale } from "Playground";

const Board = ({ planId, rows, cols }) => {
  const [pieceDict, setPieces] = useState(null);
  const stageRef = useRef(null);
  const [pieces, piecesLoading] = useList(ref(db, `pieces/${planId}`));
  const [plan, planLoading] = useObjectVal(ref(db, `plans/${planId}`));
  const [myImage, setImage] = useState(null);

  const bgLayer = new Konva.Layer({ listening: false, name: "bgLayer" });
  const pieceLayer = new Konva.Layer({ name: "pieceLayer" });

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

  const updatePieces = () => {
    const pieceLayer = stageRef.current.children.find((x) => x.attrs.name === "pieceLayer");
    const pieceDict = {};
    for (const p of pieces) {
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
    pieceLayer.batchDraw();
    setPieces(pieceDict);
  };

  const inBound = (piece) => {
    return {
      xMin: piece.x() >= 0,
      xMax: piece.x() <= Playground.width - piece.width(),
      yMin: piece.y() >= 0,
      yMax: piece.y() <= window.innerHeight - piece.height() - stageOffsetY,
    };
  };

  const getDistance = (x1, y1, x2, y2) => {
    const y = x2 - x1;
    const x = y2 - y1;
    return Math.sqrt(x * x + y * y);
  };

  const onMouseMove = (shape) => {
    if (shape) {
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
        correctedY = window.innerHeight - shape.height() - stageOffsetY;
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
    const pieceToSave = pieceDict[piece.attrs.id];
    pieceToSave.x = piece.x() / scale;
    pieceToSave.y = piece.y() / scale;
    set(ref(db, `pieces/${planId}/${piece.attrs.id}`), pieceToSave);
  };

  const loadImage = (src = "zelda2.png") => {
    const myImg = new Image();
    myImg.src = src;
    myImg.crossOrigin = "Anonymous";
    myImg.onload = function() {
      setImage(this);
      const bgImage = new Konva.Image({ width: Playground.width, height: Playground.height, image: this, opacity: 0.5 });
      bgLayer.add(bgImage);
      stageRef.current.add(bgLayer);
      stageRef.current.add(pieceLayer);
    };
  };

  // ---------------- useEffect --------------------
  useEffect(() => {
    if (!myImage && !planLoading && plan) {
      loadImage(plan.imageUrl);
    }
  }, [plan, planLoading]);

  useEffect(() => {
    if (!piecesLoading && pieces && myImage) {
      updatePieces();
    }
  }, [pieces, piecesLoading, myImage]);

  return (
    <Stage
      x={0}
      y={0}
      width={Playground.width}
      height={window.innerHeight - stageOffsetY}
      ref={stageRef}
      onDragStart={(e) => {
        const pieceLayer = stageRef.current.children.find((x) => x.attrs.name === "pieceLayer");
        const index = pieceLayer.children.indexOf(e.target);
        pieceLayer.children.splice(index, 1);
        pieceLayer.children.push(e.target);
      }}
      onDragMove={(e) => {
        onMouseMove(e.target);
      }}
      onDragEnd={(e) => {
        savePiece(e.target);
      }}
    >
    </Stage>
  );
};

export default Board;
