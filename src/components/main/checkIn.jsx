
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { set, ref } from "firebase/database";
import { useList, useObjectVal } from "react-firebase-hooks/database";
import { getBoolArrFromInt, getIntFromBoolArr } from "helpers/utils";
import { Playground, stageOffsetY, scale } from "Playground";

import "./main.css";

const Box = ({
  checked,
  onClick,
  index,
  enabled,
}) => {
  return (
    <div
      className={`box ${enabled ? "" : "inactive"}`}
      key={index}
      onClick={() => {
        if (enabled) onClick(checked, index);
      }}
    >
      {
        checked
        ? <>X</>
        : <></>
      }
    </div>
  );
};

const getRandomPos = (piece) => {
  const loc = {
    x: Math.random() * (Playground.width - piece.width * scale),
    y: Math.random() * (Playground.height - piece.height * scale - stageOffsetY),
  };
  return { x: loc.x, y: loc.y };
};

const CheckIn = ({
  days,
  planId,
}) => {
  const [pieces, setPieces] = useState([]);
  const [plan] = useObjectVal(ref(db, `plans/${planId}`));
  const [boxValues, setBoxValues] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [plist] = useList(ref(db, `pieces/${planId}`));
  const [addedPieces, setAddedPieces] = useState([]);

  useEffect(() => {
    const toSave = [];
    for (const p of plist) {
      toSave.push({
        key: p.key,
        value: p.val(),
      });
    }
    setPieces(toSave);
  }, [plist]);

  const savePlan = (planValues, addPiece) => {
    set(ref(db, `plans/${planId}/status`), getIntFromBoolArr(planValues, days));
    if (addPiece) {
      const availablePieces = pieces.filter((x) => !x.value.acquired);
      const toAdd = availablePieces[Math.floor(Math.random() * availablePieces.length)];
      setAddedPieces([...addedPieces, toAdd.key]);
      toAdd.value.acquired = true;
      const newPos = getRandomPos(toAdd.value);
      toAdd.value.x = newPos.x;
      toAdd.value.y = newPos.y;
      set(ref(db, `pieces/${planId}/${toAdd.key}`), toAdd.value);
    } else {
      if (addedPieces.length) {
        const lastPieceKey = addedPieces.pop();
        const lastAddedPiece = pieces.find((x) => x.key === lastPieceKey);
        setAddedPieces(addedPieces);
        lastAddedPiece.value.acquired = false;
        set(ref(db, `pieces/${planId}/${lastPieceKey}`), lastAddedPiece.value);
      } else {
        const addedPieces = pieces.filter((x) => x.value.acquired);
        const toRemove = addedPieces[Math.floor(Math.random() * addedPieces.length)];
        toRemove.value.acquired = false;
        set(ref(db, `pieces/${planId}/${toRemove.key}`), toRemove.value);
      }
    }
  };

  const toggleChecked = (oldVal, idx) => {
    const newBoxValues = [...boxValues];
    newBoxValues[idx] = !oldVal;
    setBoxValues(newBoxValues);
    savePlan(newBoxValues, !oldVal);
  };

  useEffect(() => {
    if (plan) {
      const boxes = getBoolArrFromInt(plan["status"], days);
      setBoxValues(boxes);
      const firstDisabled = boxes.findIndex((x) => !x);
      setCurrentIdx(firstDisabled === -1 ? boxes.length - 1 : firstDisabled - 1);
    }
  }, [plan]);

  return (
    <>
      {plan
        ? (
            <div className="box-container">
              {boxValues.map((val, idx) => {
                return (
                  <Box
                    key={idx}
                    index={idx}
                    checked={val}
                    enabled={idx === currentIdx || idx === currentIdx + 1}
                    onClick={toggleChecked}
                  />
                );
              })}
            </div>
          )
        : null
      }
    </>
  );
};

export default CheckIn;


