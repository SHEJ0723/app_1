import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 响应式断点配置
 */
export const breakpoints = {
  xs: 480,
  sm: 768,
  md: 1024,
  lg: 1200,
  xl: 1920
}

/**
 * 响应式工具类
 */
export class ResponsiveUtils {
  /**
   * 获取当前屏幕宽度
   * @returns {number} 屏幕宽度
   */
  static getScreenWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  }

  /**
   * 获取当前屏幕高度
   * @returns {number} 屏幕高度
   */
  static getScreenHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }

  /**
   * 检查是否为移动设备
   * @returns {boolean} 是否为移动设备
   */
  static isMobile() {
    return this.getScreenWidth() < breakpoints.sm
  }

  /**
   * 检查是否为平板设备
   * @returns {boolean} 是否为平板设备
   */
  static isTablet() {
    const width = this.getScreenWidth()
    return width >= breakpoints.sm && width < breakpoints.lg
  }

  /**
   * 检查是否为桌面设备
   * @returns {boolean} 是否为桌面设备
   */
  static isDesktop() {
    return this.getScreenWidth() >= breakpoints.lg
  }

  /**
   * 获取当前断点
   * @returns {string} 断点名称
   */
  static getCurrentBreakpoint() {
    const width = this.getScreenWidth()
    
    if (width < breakpoints.xs) return 'xs'
    if (width < breakpoints.sm) return 'sm'
    if (width < breakpoints.md) return 'md'
    if (width < breakpoints.lg) return 'lg'
    if (width < breakpoints.xl) return 'xl'
    return 'xxl'
  }

  /**
   * 检查是否匹配断点
   * @param {string} breakpoint - 断点名称
   * @returns {boolean} 是否匹配
   */
  static matchesBreakpoint(breakpoint) {
    const current = this.getCurrentBreakpoint()
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    const currentIndex = breakpointOrder.indexOf(current)
    const targetIndex = breakpointOrder.indexOf(breakpoint)
    
    return currentIndex >= targetIndex
  }

  /**
   * 获取设备类型
   * @returns {string} 设备类型
   */
  static getDeviceType() {
    if (this.isMobile()) return 'mobile'
    if (this.isTablet()) return 'tablet'
    return 'desktop'
  }

  /**
   * 检查是否为触摸设备
   * @returns {boolean} 是否为触摸设备
   */
  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  /**
   * 检查是否为横屏
   * @returns {boolean} 是否为横屏
   */
  static isLandscape() {
    return this.getScreenWidth() > this.getScreenHeight()
  }

  /**
   * 检查是否为竖屏
   * @returns {boolean} 是否为竖屏
   */
  static isPortrait() {
    return this.getScreenWidth() < this.getScreenHeight()
  }
}

/**
 * 组合式函数：响应式状态
 * @returns {Object} 响应式状态对象
 */
export function useResponsive() {
  const screenWidth = ref(ResponsiveUtils.getScreenWidth())
  const screenHeight = ref(ResponsiveUtils.getScreenHeight())
  const isMobile = ref(ResponsiveUtils.isMobile())
  const isTablet = ref(ResponsiveUtils.isTablet())
  const isDesktop = ref(ResponsiveUtils.isDesktop())
  const currentBreakpoint = ref(ResponsiveUtils.getCurrentBreakpoint())
  const deviceType = ref(ResponsiveUtils.getDeviceType())
  const isTouchDevice = ref(ResponsiveUtils.isTouchDevice())
  const isLandscape = ref(ResponsiveUtils.isLandscape())
  const isPortrait = ref(ResponsiveUtils.isPortrait())

  const updateResponsiveState = () => {
    screenWidth.value = ResponsiveUtils.getScreenWidth()
    screenHeight.value = ResponsiveUtils.getScreenHeight()
    isMobile.value = ResponsiveUtils.isMobile()
    isTablet.value = ResponsiveUtils.isTablet()
    isDesktop.value = ResponsiveUtils.isDesktop()
    currentBreakpoint.value = ResponsiveUtils.getCurrentBreakpoint()
    deviceType.value = ResponsiveUtils.getDeviceType()
    isLandscape.value = ResponsiveUtils.isLandscape()
    isPortrait.value = ResponsiveUtils.isPortrait()
  }

  const handleResize = () => {
    updateResponsiveState()
  }

  const handleOrientationChange = () => {
    setTimeout(() => {
      updateResponsiveState()
    }, 100)
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
  })

  return {
    screenWidth,
    screenHeight,
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
    deviceType,
    isTouchDevice,
    isLandscape,
    isPortrait,
    breakpoints,
    updateResponsiveState
  }
}

/**
 * 组合式函数：断点检测
 * @param {string} breakpoint - 断点名称
 * @returns {Ref<boolean>} 是否匹配断点
 */
export function useBreakpoint(breakpoint) {
  const { currentBreakpoint } = useResponsive()
  
  return computed(() => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint.value)
    const targetIndex = breakpointOrder.indexOf(breakpoint)
    
    return currentIndex >= targetIndex
  })
}

export default ResponsiveUtils 