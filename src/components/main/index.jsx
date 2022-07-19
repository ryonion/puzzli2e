import Puzzle from "./puzzle";
import CheckIn from "./checkIn";
import { useParams } from "react-router-dom";

const Main = () => {
  const { id } = useParams();

  return (
    <>
      <CheckIn days={25} planId={id} />
      <Puzzle planId={id} rows={5} cols={5}/>
    </>
  );
};

export default Main;
