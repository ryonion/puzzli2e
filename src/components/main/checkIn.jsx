
import { useEffect, useState } from "react";
import db from "../../firebase";
import { set, ref } from "firebase/database";
import { useListVals, useObjectVal } from "react-firebase-hooks/database";
import { getBoolArrFromInt, getIntFromBoolArr, randomProperty } from "components/common/helper";
import "./main.css";

// const Box = ({
//   checked,
//   onClick,
// }) => {
//   const [boxChecked, setBoxChecked] = useState(false);
//   useEffect(() => {
//     setBoxChecked(checked);
//   }, [checked]);

//   const toggleChecked = () => {
//     const newVal = !boxChecked;
//     setBoxChecked(newVal);
//     onClick(newVal);
//   };
//   return (
//     <div
//       className="box"
//       onClick={toggleChecked}
//     >
//       {
//         boxChecked
//         ? <>X</>
//         : <></>
//       }
//     </div>
//   );
// };

const CheckIn = ({
  days,
}) => {
  const [plan] = useObjectVal(ref(db, "plans/-N6BhpAMvqnb8_zZSRLB"));
  const [pieces] = useObjectVal(ref(db, "pieces/1"));
  const [boxValues, setBoxValues] = useState([]);
  const [plist] = useListVals(ref(db, "pieces/1"));

  // todo: get pieces as array so we can filter them.
  useEffect(() => {
    console.log(plist);
  }, [plist]);


  const savePlan = (planValues, addPiece) => {
    set(ref(db, "plans/-N6BhpAMvqnb8_zZSRLB/status"), getIntFromBoolArr(planValues, days));
    const keys = Object.keys(pieces);
    if (addPiece) {
      let maxLoop = 100;
      while (keys.length && maxLoop) {
        const key = randomProperty(pieces);
        if (!pieces[key].acquired) {
          pieces[key].acquired = true;
          set(ref(db, `pieces/1/${key}`), pieces[key]);
          break;
        }
        maxLoop--;
      }
    } else {
      for (const key in pieces) {
        if (pieces[key].acquired) {
          pieces[key].acquired = false;
          set(ref(db, `pieces/1/${key}`), pieces[key]);
          break;
        }
      }
    }
  };

  // new data
  // useEffect(() => {
  //   push(ref(db, "plans"), {
  //     userId: 1,
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
      setBoxValues(getBoolArrFromInt(plan["status"], days));
    }
  }, [plan]);

  return (
    <div className="box-container">
      {boxValues.map((val, idx) => {
        return (
          <div
            key={idx}
            className="box"
            onClick={() => {
              toggleChecked(val, idx);
            }}
          >
            {
              val
              ? <>X</>
              : <></>
            }
          </div>
        );
      })}
    </div>
  );
};

export default CheckIn;


