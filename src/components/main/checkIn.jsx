
import { useEffect, useState } from "react";
import "./main.css";

const Box = ({
  checked,
}) => {
  const [boxChecked, setBoxChecked] = useState(false);
  useEffect(() => {
    setBoxChecked(checked);
  }, [checked]);

  const toggleChecked = () => {
    setBoxChecked(!boxChecked);
  };
  return (
    <div
      className="box"
      onClick={toggleChecked}>
      {
        boxChecked
        ? <>X</>
        : <></>
      }
    </div>
  );
};

const CheckIn = ({
  days,
}) => {
  const [boxes, setBoxes] = useState([]);
  useEffect(() => {
    const newBoxes = [];
    for (let i = 0; i < days; ++i) {
      newBoxes.push(
          <Box
            key={i}
            checked={false}
          />,
      );
    }
    setBoxes(newBoxes);
  }, []);

  return (
    <div className="box-container">
      {boxes}
    </div>
  );
};

export default CheckIn;


