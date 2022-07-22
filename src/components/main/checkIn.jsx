
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { set, ref } from "firebase/database";
import { useListVals, useObjectVal } from "react-firebase-hooks/database";
import { getBoolArrFromInt, getIntFromBoolArr, randomProperty } from "components/common/helper";
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

const CheckIn = ({
  days,
  planId,
}) => {
  const [plan] = useObjectVal(ref(db, `plans/${planId}`));
  const [pieces] = useObjectVal(ref(db, `pieces/${planId}`));
  const [boxValues, setBoxValues] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [plist] = useListVals(ref(db, `plans/${planId}`));

  // todo: get pieces as array so we can filter them.
  // useEffect(() => {
  //   console.log(plist);
  // }, [plist]);

  const savePlan = (planValues, addPiece) => {
    set(ref(db, `plans/${planId}/status`), getIntFromBoolArr(planValues, days));
    const keys = Object.keys(pieces);
    if (addPiece) {
      let maxLoop = 100;
      while (keys.length && maxLoop) {
        const key = randomProperty(pieces);
        if (!pieces[key].acquired) {
          pieces[key].acquired = true;
          set(ref(db, `pieces/${planId}/${key}`), pieces[key]);
          break;
        }
        maxLoop--;
      }
    } else {
      for (const key in pieces) {
        if (pieces[key].acquired) {
          pieces[key].acquired = false;
          set(ref(db, `pieces/${planId}/${key}`), pieces[key]);
          break;
        }
      }
    }
  };

  // new data
  // useEffect(() => {
  //   push(ref(db, "plans"), {
  //     userId: 2,
  //     status: 0,
  //   });
  // }, []);

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
      const firstDisabled = boxes.findIndex((x)=>!x);
      console.log(firstDisabled)
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


