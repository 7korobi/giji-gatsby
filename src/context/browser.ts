import {
  Axis,
  useDeviceMotion,
  useDeviceOrientation,
  useGeoLocation,
  useContextMenu,
  useVisible,
  useInternet,
  useViewport,
} from 'react-petit-hooks/lib/browser'
import { useEffect } from 'react'

export function useMotion() {
  const [[ax, ay, az], [gx, gy, gz], [mx, my, mz], [rra, rrb, rrg]] = useDeviceMotion(
    motion,
    rotate
  )
  const [[ra, rb, rg], absolute] = useDeviceOrientation(rotate)

  function motion(oldVal: string | null, newVal: number | null, axis: Axis): string | null {
    return ''
  }
  function rotate(oldVal: string | null, newVal: number | null, axis: Axis): string | null {
    return ''
  }
}

export function useGeo() {
  const [[lat, lon], alt, heading, speed] = useGeoLocation(geo, mks)
  return [[lat, lon, alt, heading, speed]]

  function geo(oldVal: string | null, newVal: number | null, axis: Axis): string | null {
    return axis.label(newVal)
  }
  function mks(oldVal: string | null, newVal: number | null, axis: Axis): string | null {
    return axis.label(newVal)
  }
}

export function useActive(): [boolean] {
  const [isMenu, setIsMenu] = useContextMenu()
  const [isOnline] = useInternet()
  const [isVisible] = useVisible()
  const [width, height, scale] = useViewport()

  useEffect(() => {
    const classes = [
      isMenu ? 'menu' : 'glass',
      isOnline ? 'online' : 'offline',
      isVisible ? 'active' : 'hidden',
    ]
    document.documentElement.className = classes.join(' ')
  }, [isMenu, isOnline, isVisible])

  useEffect(() => {
    setIsMenu(true)
  }, [width, height])

  useEffect(() => {
    setIsMenu(scale === 1)
  }, [scale])

  return [isOnline && isVisible]
}
