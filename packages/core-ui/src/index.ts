/**
 * core-ui - Componentes UI reutilizables
 * 
 * Proporciona componentes shadcn/ui + Tailwind CSS personalizados
 * - Button
 * - Input
 * - Select
 * - Modal/Dialog
 * - Card
 * - Table
 * - Badge
 * - Toast
 * - Form components
 */

export { Button } from './components/button';
export { Input } from './components/input';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/card';
export { Modal, ModalContent, ModalHeader, ModalFooter } from './components/modal';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/table';
export { Badge } from './components/badge';
export { Toast, useToast } from './components/toast';

export type { ButtonProps } from './components/button';
export type { InputProps } from './components/input';
