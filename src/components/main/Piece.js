import Konva from "konva";

// todo: remove constructor, use Konva.Shape directly, add custom attributes to Konva nodes
class Piece {
  constructor(rowIndex, colIndex, width, height) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.width = width;
    this.height = height;
    this.x = this.width * this.colIndex;
    this.y = this.height * this.rowIndex;
    this.correctX = this.x;
    this.correctY = this.y;
    this.acquired = false;
  }
  getShape(image) {
    const shape = new Konva.Shape({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      correctX: this.x,
      correctY: this.y,
      sceneFunc: (context) => {
        // todo: shorten
        context.beginPath();
        context.drawImage(image, this.colIndex * image.naturalWidth / this.colCount, this.rowIndex * image.naturalHeight / this.rowCount, image.naturalWidth/this.colCount, image.naturalHeight/this.rowCount, 0, 0, this.width, this.height);
        context.rect(0, 0, this.width, this.height);
        context.closePath();
        // (!) Konva specific method, it is very important
        context.fillStrokeShape(shape);
      },
      draggable: true,
    });

    return shape;
  };
};

export {
  Piece,
};
