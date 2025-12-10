'use client';

import StudentForm from '@/components/student/student-form';
import StudentTable from '@/components/student/student-table';
import { Student } from '@/db/schema';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const HomePage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/students');
        if (!res.ok) throw new Error('Failed to fetch');
        const json: Student[] = await res.json();
        setStudents(json);
      } catch {
        toast.error('ไม่สามารถดึงข้อมูลนักศึกษาได้');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreated = (created: Student) => {
    setStudents((prev) => [created, ...prev]);
    toast.success('สร้างนักศึกษาสำเร็จ');
  };

  const handleDelete = async (id: string) => {
    const prev = students;
    setStudents((p) => p.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        toast.success('ลบเรียบร้อย');
        return;
      }
      throw new Error('Delete failed');
    } catch {
      setStudents(prev);
      toast.error('ลบไม่สำเร็จ — ลองใหม่');
    }
  };

  const handleUpdate = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      if (!res.ok) throw new Error('Failed to fetch');
      const json: Student[] = await res.json();
      setStudents(json);
      toast.success('อัปเดตรายชื่อแล้ว');
    } catch {
      toast.error('ไม่สามารถอัปเดตรายชื่อได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StudentTable
            students={students}
            loading={loading}
            onDelete={handleDelete}
            onRefresh={handleRefresh}
            onUpdate={handleUpdate}
          />
        </div>
        <aside>
          <StudentForm onCreated={handleCreated} />
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
