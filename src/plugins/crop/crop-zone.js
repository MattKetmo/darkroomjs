import fabric from 'fabric';

export let CropZone = fabric.util.createClass(fabric.Rect, {
  _render: function (ctx) {
    this.callSuper('_render', ctx);

    let dashWidth = 7;

    // Set original scale
    let flipX = this.flipX ? -1 : 1;
    let flipY = this.flipY ? -1 : 1;
    let scaleX = flipX / this.scaleX;
    let scaleY = flipY / this.scaleY;

    ctx.scale(scaleX, scaleY);

    // Overlay rendering
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this._renderOverlay(ctx);

    // Set dashed borders
    if (ctx.setLineDash !== undefined) {
      ctx.setLineDash([dashWidth, dashWidth]);
    } else if (ctx.mozDash !== undefined) {
      ctx.mozDash = [dashWidth, dashWidth];
    }

    // First lines rendering with black
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this._renderBorders(ctx);
    this._renderGrid(ctx);

    // Re render lines in white
    ctx.lineDashOffset = dashWidth;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this._renderBorders(ctx);
    this._renderGrid(ctx);

    // Reset scale
    ctx.scale(1 / scaleX, 1 / scaleY);
  },

  _renderOverlay: function (ctx) {
    var canvas = ctx.canvas;

    //
    //    x0    x1        x2      x3
    // y0 +------------------------+
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    // y1 +------+---------+-------+
    //    |\\\\\\|         |\\\\\\\|
    //    |\\\\\\|    0    |\\\\\\\|
    //    |\\\\\\|         |\\\\\\\|
    // y2 +------+---------+-------+
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    // y3 +------------------------+
    //

    var x0 = Math.ceil(-this.getWidth() / 2 - this.getLeft());
    var x1 = Math.ceil(-this.getWidth() / 2);
    var x2 = Math.ceil(this.getWidth() / 2);
    var x3 = Math.ceil(this.getWidth() / 2 + (canvas.width - this.getWidth() - this.getLeft()));

    var y0 = Math.ceil(-this.getHeight() / 2 - this.getTop());
    var y1 = Math.ceil(-this.getHeight() / 2);
    var y2 = Math.ceil(this.getHeight() / 2);
    var y3 = Math.ceil(this.getHeight() / 2 + (canvas.height - this.getHeight() - this.getTop()));

    ctx.beginPath();

    // Draw outer rectangle.
    // Numbers are +/-1 so that overlay edges don't get blurry.
    ctx.moveTo(x0 - 1, y0 - 1);
    ctx.lineTo(x3 + 1, y0 - 1);
    ctx.lineTo(x3 + 1, y3 + 1);
    ctx.lineTo(x0 - 1, y3 - 1);
    ctx.lineTo(x0 - 1, y0 - 1);
    ctx.closePath();

    // Draw inner rectangle.
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x1, y1);

    ctx.closePath();
    ctx.fill();
  },

  _renderBorders: function (ctx) {
    ctx.beginPath();
    ctx.moveTo(-this.getWidth() / 2, -this.getHeight() / 2); // upper left
    ctx.lineTo(this.getWidth() / 2, -this.getHeight() / 2); // upper right
    ctx.lineTo(this.getWidth() / 2, this.getHeight() / 2); // down right
    ctx.lineTo(-this.getWidth() / 2, this.getHeight() / 2); // down left
    ctx.lineTo(-this.getWidth() / 2, -this.getHeight() / 2); // upper left
    ctx.stroke();
  },

  _renderGrid: function (ctx) {
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(-this.getWidth() / 2 + 1 / 3 * this.getWidth(), -this.getHeight() / 2);
    ctx.lineTo(-this.getWidth() / 2 + 1 / 3 * this.getWidth(), this.getHeight() / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-this.getWidth() / 2 + 2 / 3 * this.getWidth(), -this.getHeight() / 2);
    ctx.lineTo(-this.getWidth() / 2 + 2 / 3 * this.getWidth(), this.getHeight() / 2);
    ctx.stroke();
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(-this.getWidth() / 2, -this.getHeight() / 2 + 1 / 3 * this.getHeight());
    ctx.lineTo(this.getWidth() / 2, -this.getHeight() / 2 + 1 / 3 * this.getHeight());
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-this.getWidth() / 2, -this.getHeight() / 2 + 2 / 3 * this.getHeight());
    ctx.lineTo(this.getWidth() / 2, -this.getHeight() / 2 + 2 / 3 * this.getHeight());
    ctx.stroke();
  }
});
