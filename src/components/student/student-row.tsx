'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Student } from '@/db/schema';
import { FC } from 'react';

type StudentRowProps = {
  student: Student;
  onCopy: (id: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  loadingDeleteId: string | null;
};

const StudentRow: FC<StudentRowProps> = ({
  student,
  onCopy,
  onEdit,
  onDelete,
  loadingDeleteId,
}) => {
  return (
    <TableRow>
      <TableCell>{student.id}</TableCell>
      <TableCell>{student.name}</TableCell>
      <TableCell className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCopy(student.id)}
        >
          คัดลอกรหัส
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(student)}
        >
          แก้ไข
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(student)}
          disabled={loadingDeleteId === student.id}
        >
          {loadingDeleteId === student.id ? 'กำลังลบ...' : 'ลบ'}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default StudentRow;
