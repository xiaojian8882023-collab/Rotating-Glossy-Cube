# High Refresh Rate Display Support (Experimental)

## Overview

This project includes **experimental support** for high refresh rate displays (90 FPS, 120 FPS, 240 FPS). This feature is **disabled by default** and can be enabled via URL parameters.

**⚠️ Important:** This is an experimental feature. Physics simulation and rendering may behave differently at high frame rates. Test thoroughly before deploying.

## Supported Frame Rates

- `60 FPS` - Default (standard 60 Hz displays)
- `90 FPS` - 90 Hz displays
- `120 FPS` - 120 Hz displays (common gaming monitors)
- `144 FPS` - 144 Hz displays
- `165 FPS` - 165 Hz displays
- `240 FPS` - 240 Hz displays (high-end gaming)

## How to Enable

### Via URL Parameters

Append query parameters to your application URL:

```
# Enable 120 FPS rendering
?targetFPS=120

# Enable 240 FPS rendering
?targetFPS=240

# Enable high refresh rate detection
?highFPS

# Enable debug logging for FPS stats
?debug

# Combine multiple parameters
?targetFPS=120&debug
```

### Examples

```html
<!-- Load at 90 FPS -->
https://example.com/glossy-cube.html?targetFPS=90

<!-- Load at 120 FPS with debug info -->
https://example.com/glossy-cube.html?targetFPS=120&debug

<!-- Enable high refresh rate detection -->
https://example.com/glossy-cube.html?highFPS&debug
```

## How It Works

### Physics Simulation

The physics simulation maintains stability at high frame rates through:

1. **Adaptive Timesteps**: Physics timestep scales based on target FPS
2. **Increased Substeps**: More physics calculation steps per frame at higher FPS
3. **Fixed 60Hz Base**: Physics simulation anchored at 60 Hz for stability

### Frame Rate Limiting

- Renders are synchronized with your monitor's refresh rate
- If your target FPS exceeds display refresh rate, rendering occurs at display refresh rate
- Frame limiting prevents excessive GPU usage

### Performance Considerations

**Higher FPS = Higher GPU Usage**

- 90 FPS: ~50% more rendering than 60 FPS
- 120 FPS: ~100% more rendering than 60 FPS
- 240 FPS: ~300% more rendering than 60 FPS

## Browser Requirements

- **Chrome/Edge**: Full support via `requestAnimationFrame`
- **Firefox**: Full support via `requestAnimationFrame`
- **Safari**: Support varies by macOS version (check system preferences)
- **Mobile**: Limited support (most displays capped at 60 Hz)

## Console Output

When high FPS is enabled, the console will show:

```
🚀 [HighFPS] Experimental high refresh rate support enabled!
URL Parameters (append to URL):
  ?targetFPS=60   - Set target FPS
  ?targetFPS=90   - Experimental 90 FPS support
  ...

[HighFPS] Display refresh rate: 120 Hz
[HighFPS] Target FPS: 120 (8.33ms per frame)
```

With debug mode (`?debug`), additional stats appear:

```
[HighFPS] Average FPS: 118 (Target: 120)
```

## Known Limitations

1. **Browser Dependent**: Not all browsers support high refresh rate displays equally
2. **Monitor Dependent**: Frame rate capped by your display's refresh rate
3. **Physics Stability**: May experience physics glitches at extreme frame rates (240 FPS)
4. **Battery Impact**: Significantly higher power consumption on laptops
5. **Mobile**: Most mobile devices capped at 60 FPS

## Testing High FPS

### Prerequisites

- Display capable of 90+ Hz refresh rate
- Browser supporting `requestAnimationFrame`
- Decent GPU (recommended RTX 3060 or better for 240 FPS)

### Quick Test

1. Open DevTools (F12)
2. Open Console tab
3. Load with: `?targetFPS=120&debug`
4. Monitor console for FPS stats
5. Watch cube spawn performance

### Benchmarking

```javascript
// In console, check average FPS
// Logs automatically with ?debug enabled
```

## Troubleshooting

### FPS not reaching target

- Check monitor refresh rate (Windows: Settings → Display → Advanced Display Settings)
- Verify browser supports high refresh rate
- Check GPU is capable of rendering at target FPS
- Try closing other applications

### Physics feels unstable

- Physics simulation uses adaptive timesteps
- May need to increase substeps (modify `highRefreshRate.js`)
- Try lower target FPS (e.g., 120 instead of 240)

### Console showing "Invalid target FPS"

- Ensure targetFPS is: 60, 90, 120, 144, 165, or 240
- Check URL parameter syntax: `?targetFPS=120` (not `?fps=120`)

## Performance Tips

1. **Use 120 FPS for smooth visuals** without excessive overhead
2. **240 FPS is overkill** for most use cases
3. **Disable other browser tabs** to reduce system load
4. **Monitor temperature** on laptops (high FPS = higher heat)
5. **Check battery impact** before enabling on portable devices

## Future Improvements

- [ ] Dynamic FPS adjustment based on performance
- [ ] GPU utilization monitoring
- [ ] Thermal throttling detection
- [ ] Mobile display rate optimization
- [ ] Variable Rate Shading support

## References

- [RequestAnimationFrame MDN](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Cannon-ES Physics Engine](https://www.npmjs.com/package/cannon-es)
- [Three.js Documentation](https://threejs.org/docs/)
