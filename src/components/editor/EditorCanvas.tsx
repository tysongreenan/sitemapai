import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  NodeProps,
  ConnectionLineType,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow,
  useStoreApi,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import {
  Plus,
  Search,
  Copy,
  Download,
  Sparkles,
  Maximize2,
  Trash2,
  Scissors,
  Clipboard,
  Home,
  Menu,
  PanelRight,
  FileText,
  Grid,
  MessageCircle,
  BarChart,
  Zap,
  Mail,
  User,
  CreditCard,
  LogIn,
  UserPlus,
  RefreshCw,
  Share2,
  Save,
  Layers,
  ChevronRight,
  ChevronDown,
  Package,
  X,
  Layout,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import EnhancedToolbar from './EditorToolbar';
import ComponentLibrary from './ComponentLibrary';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import WireframePageNode from './nodes/WireframePageNode';
import ContextMenu from './ContextMenu';

// -----------------------------------------------------------------------------
// Component Categories Definition (Moved here for easy access by EditorCanvas)
// -----------------------------------------------------------------------------
const componentCategories = {
  navigation: {
    name: 'Navigation',
    icon: <Menu size={16} />,
    components: [
      { id: 'navbar', name: 'Navigation Bar', icon: <Menu size={14} />, category: 'navigation', preview: 'navbar' },
      { id: 'sidebar', name: 'Sidebar Menu', icon: <PanelRight size={14} />, category: 'navigation', preview: 'sidebar' },
      { id: 'breadcrumb', name: 'Breadcrumb', icon: <ChevronRight size={14} />, category: 'navigation', preview: 'breadcrumb' },
      { id: 'tabs', name: 'Tab Navigation', icon: <Layout size={14} />, category: 'navigation', preview: 'tabs' },
    ],
  },
  hero: {
    name: 'Hero Sections',
    icon: <Sparkles size={16} />,
    components: [
      { id: 'hero-centered', name: 'Hero Centered', icon: <Layout size={14} />, category: 'hero', preview: 'hero-centered' },
      { id: 'hero-split', name: 'Hero Split', icon: <Grid size={14} />, category: 'hero', preview: 'hero-split' },
      { id: 'hero-video', name: 'Hero with Video', icon: <FileText size={14} />, category: 'hero', preview: 'hero-video' },
      { id: 'hero-form', name: 'Hero with Form', icon: <Mail size={14} />, category: 'hero', preview: 'hero-form' },
    ],
  },
  content: {
    name: 'Content Blocks',
    icon: <FileText size={16} />,
    components: [
      { id: 'text-block', name: 'Text Block', icon: <FileText size={14} />, category: 'content', preview: 'text' },
      { id: 'feature-grid', name: 'Feature Grid', icon: <Grid size={14} />, category: 'content', preview: 'features' },
      { id: 'testimonials', name: 'Testimonials', icon: <MessageCircle size={14} />, category: 'content', preview: 'testimonials' },
      { id: 'team-section', name: 'Team Section', icon: <User size={14} />, category: 'content', preview: 'team' },
      { id: 'stats', name: 'Stats Section', icon: <BarChart size={14} />, category: 'content', preview: 'stats' },
      { id: 'timeline', name: 'Timeline', icon: <ArrowRight size={14} />, category: 'content', preview: 'timeline' },
    ],
  },
  cta: {
    name: 'Calls to Action',
    icon: <Zap size={16} />,
    components: [
      { id: 'cta-simple', name: 'Simple CTA', icon: <Zap size={14} />, category: 'cta', preview: 'cta-simple' },
      { id: 'cta-split', name: 'Split CTA', icon: <Grid size={14} />, category: 'cta', preview: 'cta-split' },
      { id: 'cta-newsletter', name: 'Newsletter CTA', icon: <Mail size={14} />, category: 'cta', preview: 'newsletter' },
    ],
  },
  forms: {
    name: 'Form Elements',
    icon: <FileText size={16} />,
    components: [
      { id: 'contact-form', name: 'Contact Form', icon: <Mail size={14} />, category: 'forms', preview: 'contact' },
      { id: 'login-form', name: 'Login Form', icon: <LogIn size={14} />, category: 'forms', preview: 'login' },
      { id: 'signup-form', name: 'Signup Form', icon: <UserPlus size={14} />, category: 'forms', preview: 'signup' },
      { id: 'checkout-form', name: 'Checkout Form', icon: <CreditCard size={14} />, category: 'forms', preview: 'checkout' },
    ],
  },
  footer: {
    name: 'Footers',
    icon: <Layout size={16} />,
    components: [
      { id: 'footer-simple', name: 'Simple Footer', icon: <Layout size={14} />, category: 'footer', preview: 'footer-simple' },
      { id: 'footer-columns', name: 'Multi-Column Footer', icon: <Grid size={14} />, category: 'footer', preview: 'footer-columns' },
      { id: 'footer-newsletter', name: 'Footer with Newsletter', icon: <Mail size={14} />, category: 'footer', preview: 'footer-newsletter' },
    ],
  },
};

// Export componentCategories separately
export { componentCategories };

const EditorCanvas = () => {
  // Component implementation would go here
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default EditorCanvas;