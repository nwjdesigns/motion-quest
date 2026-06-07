// ─── CAVALRY SPHERE DISTRIBUTION ─────────────────────────────────────────────
// Inputs (add these as attributes on the Distribution node):
//   radius   - Double3  - X/Y/Z scale of the sphere (e.g. 300, 300, 300)
//   rotation - Double3  - X/Y/Z rotation in degrees
//   count    - Int      - number of points (Fibonacci mode only)
//   mode     - Int      - 0 = Fibonacci, 1 = Globe
//   rows     - Int      - latitude lines (Globe mode only)
//   columns  - Int      - longitude lines (Globe mode only)
//   minScale - Double   - scale at the back of the sphere (e.g. 0.5)
//   maxScale - Double   - scale at the front of the sphere (e.g. 1.0)
//
// Notes:
//   - Depth-based scaling is handled here via appendSize.
//   - Image sampler scaling should be wired separately into the
//     Duplicator's Shape Scale (they multiply together).
//   - Cavalry JS has no image sampling API, so that must stay
//     in the node graph.
// ─────────────────────────────────────────────────────────────────────────────

function degToRad(v) {
    return v * Math.PI / 180.0;
}

function point3(x, y, z) {
    return { x: x, y: y, z: z };
}

function rotateX(p, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    return point3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
}

function rotateY(p, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    return point3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
}

function rotateZ(p, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    return point3(p.x * c - p.y * s, p.x * s + p.y * c, p.z);
}

function fibonacciSphereUnit(i, total) {
    if (total <= 1) return point3(0, 0, 1);
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    var t = i / (total - 1);
    var y = 1 - t * 2;
    var r = Math.sqrt(Math.max(0, 1 - y * y));
    var theta = goldenAngle * i;
    return point3(Math.cos(theta) * r, y, Math.sin(theta) * r);
}

function globeSphereUnit(i, r, c) {
    var lat = Math.floor(i / c);
    var lng = i % c;
    var phi = Math.PI * lat / r;
    var theta = 2.0 * Math.PI * lng / c;
    return point3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
    );
}

function makeSphere() {
    var cloud = new cavalry.PointCloud();

    var rx = degToRad(rotation.x);
    var ry = degToRad(rotation.y);
    var rz = degToRad(rotation.z);

    var total = (mode < 1) ? count : rows * columns;

    for (var i = 0; i < total; i++) {
        var p = (mode < 1)
            ? fibonacciSphereUnit(i, total)
            : globeSphereUnit(i, rows, columns);

        p = point3(
            p.x * radius.x,
            p.y * radius.y,
            p.z * radius.z
        );

        p = rotateX(p, rx);
        p = rotateY(p, ry);
        p = rotateZ(p, rz);

        var depth = (p.z + radius.z) / (2.0 * radius.z);
        var scale = minScale + depth * (maxScale - minScale);

        cloud.appendPoint(new cavalry.Point(p.x, p.y));
        cloud.appendSize(new cavalry.Point(scale, scale));
    }

    return cloud;
}

makeSphere();
