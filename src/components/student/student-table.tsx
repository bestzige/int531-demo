'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Student } from '@/db/schema';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import StudentRow from './student-row';

type UpdateFormValues = {
  firstName: string;
  lastName: string;
};

type StudentTableProps = {
  students: Student[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onRefresh?: () => void;
  onUpdate?: (updated: Student) => void;
};

const StudentTable: FC<StudentTableProps> = ({
  students,
  loading,
  onDelete,
  onRefresh,
  onUpdate,
}) => {
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [loadingUpdateId, setLoadingUpdateId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const form = useForm<UpdateFormValues>({
    defaultValues: { firstName: '', lastName: '' },
  });

  const handleEdit = (student: Student) => {
    const parts = student.name.split(' ');
    form.reset({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
    });
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(`รหัสนักศึกษา ${id} ถูกคัดลอกแล้ว`);
    } catch {
      toast.error('คัดลอกไม่สำเร็จ');
    }
  };

  const handleUpdateSubmit = async (values: UpdateFormValues) => {
    if (!selectedStudent) return;
    setLoadingUpdateId(selectedStudent.id);
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      onUpdate?.(updated);
      toast.success('อัปเดตเรียบร้อย');
      setIsEditOpen(false);
    } catch {
      toast.error('อัปเดตไม่สำเร็จ');
    } finally {
      setLoadingUpdateId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    setLoadingDeleteId(selectedStudent.id);
    try {
      await onDelete(selectedStudent.id);
      toast.success('ลบเรียบร้อย');
      setIsDeleteOpen(false);
    } catch {
      toast.error('ลบไม่สำเร็จ');
    } finally {
      setLoadingDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">รายชื่อนักศึกษา</h2>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
        >
          {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัส</TableHead>
            <TableHead>ชื่อ</TableHead>
            <TableHead className="text-right">การกระทำ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loadingDeleteId={loadingDeleteId}
              />
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground p-4"
              >
                {loading
                  ? 'กำลังโหลดรายชื่อ...'
                  : 'ยังไม่มีนักศึกษา — เพิ่มคนแรกได้เลย'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขนักศึกษา</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateSubmit)}
              className="space-y-4 mt-2"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">ปิด</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={loadingUpdateId === selectedStudent?.id}
                >
                  {loadingUpdateId === selectedStudent?.id
                    ? 'กำลังบันทึก...'
                    : 'บันทึก'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loadingDeleteId === selectedStudent?.id}
            >
              {loadingDeleteId === selectedStudent?.id ? 'กำลังลบ...' : 'ลบ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentTable;
