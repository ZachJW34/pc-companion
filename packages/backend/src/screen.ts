export class ScreenHandler {
  width: number;
  height: number;

  constructor(dimensions: { width: number; height: number }) {
    this.width = dimensions.width;
    this.height = dimensions.height;
  }
}
