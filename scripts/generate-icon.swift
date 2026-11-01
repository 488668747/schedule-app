import AppKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let iconset = root.appendingPathComponent("build/Rhythm.iconset")
try FileManager.default.createDirectory(at: iconset, withIntermediateDirectories: true)

func render(_ pixels: Int) -> Data {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    let transform = NSAffineTransform()
    transform.scale(by: CGFloat(pixels) / 1024)
    transform.concat()
    let square = NSBezierPath(roundedRect: NSRect(x: 96, y: 96, width: 832, height: 832), xRadius: 200, yRadius: 200)
    NSGraphicsContext.saveGraphicsState()
    let shadow = NSShadow()
    shadow.shadowColor = NSColor.black.withAlphaComponent(0.16)
    shadow.shadowBlurRadius = 32
    shadow.shadowOffset = NSSize(width: 0, height: -12)
    shadow.set()
    NSColor(calibratedRed: 0.33, green: 0.47, blue: 0.91, alpha: 1).setFill()
    square.fill()
    NSGraphicsContext.restoreGraphicsState()
    NSGradient(starting: NSColor(calibratedRed: 0.34, green: 0.47, blue: 0.91, alpha: 1), ending: NSColor(calibratedRed: 0.47, green: 0.58, blue: 0.93, alpha: 1))!.draw(in: square, angle: 45)
    let spark = NSBezierPath()
    let points: [(CGFloat, CGFloat)] = [(12,3),(13.7,8.3),(19,10),(13.7,11.7),(12,17),(10.3,11.7),(5,10),(10.3,8.3)]
    func point(_ p: (CGFloat, CGFloat)) -> NSPoint { NSPoint(x: 224 + p.0 * 24, y: 224 + (24 - p.1) * 24 - 48) }
    spark.move(to: point(points[0]))
    for p in points.dropFirst() { spark.line(to: point(p)) }
    spark.close()
    spark.lineWidth = 34
    spark.lineJoinStyle = .round
    NSColor.white.setStroke()
    spark.stroke()
    NSGraphicsContext.restoreGraphicsState()
    return bitmap.representation(using: .png, properties: [:])!
}

for size in [16, 32, 128, 256, 512] {
    try render(size).write(to: iconset.appendingPathComponent("icon_\(size)x\(size).png"))
    try render(size * 2).write(to: iconset.appendingPathComponent("icon_\(size)x\(size)@2x.png"))
}
print("已生成 Mac 应用图标")
