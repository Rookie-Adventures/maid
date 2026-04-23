# Hermes Dynamic UI 组件视觉标准 (V0.1)

## 1. 设计语言
- **风格**: Material 3 (Material You)。
- **配色**: 必须使用 `useTheme` 提供的 `colorScheme`。
- **动效**: 使用 `react-native-reanimated` 实现 300ms 的平滑平移和淡入淡出。

---

## 2. 标准零件定义

### 2.1 FeatureToggle (开关零件)
- **外观**: 
  - 高度: 72dp
  - 内边距: 16dp
  - 交互: 右侧 Switch，左侧 Title + Description。
- **状态**: 
  - 禁用状态下色值调低 50%。
  - 点击时触发 `Haptics.impactAsync`。

### 2.2 FeaturePicker (下拉零件)
- **外观**: 
  - 采用 Bottom Sheet 风格。
  - 选中项高亮背景色为 `colorScheme.primaryContainer`。

### 2.3 DashboardFAB (全局应用按钮)
- **外观**: 
  - 位置: 页面右下角悬浮。
  - 图标: `sync` 或 `check`。
  - 文字: "Apply & Reboot"。

---

## 3. 动态渲染逻辑
- 组件必须能处理后端发来的 `options` 字段（针对 `enum` 类型）。
- 每一个零件必须在内部管理自己的 **“中间态”**，直到用户点击 FAB 按钮统一提交。
