import useImage from "use-image";
import { Image } from "react-konva";

const PuzzleImage = ({
  width,
  height,
}) => {
  const [image] = useImage("zelda2.png");
  return <Image image={image} width={width} height={height} opacity={.5}/>;
};

export default PuzzleImage;
