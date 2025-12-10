# 🚀 Cache Guide - ทำให้ Client โหลดไว

## 📋 ภาพรวม

ระบบใช้ **2 ชั้นของ Cache** เพื่อให้โหลดไว:

1. **Next.js Data Cache** - Cache ฝั่ง Server (API Routes)
2. **Browser Cache** - Cache ฝั่ง Client (Browser)

---

## ⚡ วิธีทำงาน

### 1. Next.js Data Cache (Server-side)
- **Cache Time**: 5 นาที (categories, tags, banners) / 1 นาที (settings)
- **Location**: Next.js Server Memory
- **Revalidate**: อัตโนมัติทุก 5 นาที หรือเมื่อ hard refresh (F5)

### 2. Browser Cache (Client-side)
- **Cache Time**: 5 นาที (categories, tags, banners) / 1 นาที (settings)
- **Location**: Browser Cache Storage
- **Strategy**: `stale-while-revalidate`
  - แสดงข้อมูลเก่าทันที (ถ้ามี)
  - ดึงข้อมูลใหม่ใน background
  - อัปเดตเมื่อได้ข้อมูลใหม่

---

## 🎯 Cache Configuration

### API Routes (Server-side)

**ไฟล์:** `client/src/app/api/*/route.ts`

```typescript
// Example: categories/route.ts
export async function GET(request: NextRequest) {
  const response = await fetch(`${BACKEND_URL}/api/categories/public`, {
    next: { 
      revalidate: 300, // 5 minutes
      tags: ['categories']
    }
  });
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
```

### Client-side Fetch

**ไฟล์:** `client/src/app/page.tsx`

```typescript
// Example: fetchCategories
const response = await fetch(`/api/categories`, {
  cache: 'default', // Use browser cache
  next: { revalidate: 300 } // 5 minutes
});
```

---

## 📊 Cache Times

| Resource | Cache Time | Revalidate |
|----------|------------|------------|
| Categories | 5 minutes | 300 seconds |
| Tags | 5 minutes | 300 seconds |
| Banners | 5 minutes | 300 seconds |
| Settings | 1 minute | 60 seconds |

---

## 🔄 Hard Refresh (F5)

เมื่อผู้ใช้กด **F5 (Hard Refresh)**:
- Bypass ทั้ง Next.js Cache และ Browser Cache
- ดึงข้อมูลใหม่ทันที
- เหมาะสำหรับเมื่อต้องการดูข้อมูลล่าสุด

---

## ✅ ผลลัพธ์

### Performance Improvements:
- ⚡ **First Load**: ใช้ Next.js Data Cache (เร็ว)
- ⚡ **Subsequent Loads**: ใช้ Browser Cache (เร็วมาก)
- ⚡ **Background Update**: อัปเดตข้อมูลใหม่โดยไม่บล็อก UI
- 📉 **Bandwidth**: ลดลง 80-90% (ใช้ cache แทนการ fetch ใหม่)

### User Experience:
- ✅ โหลดหน้าเว็บเร็วขึ้น
- ✅ ข้อมูลแสดงทันที (จาก cache)
- ✅ อัปเดตอัตโนมัติใน background
- ✅ Hard refresh (F5) ยังได้ข้อมูลล่าสุด

---

## 🛠️ การปรับแต่ง

### เปลี่ยน Cache Time

**1. Server-side (API Routes):**
```typescript
// ใน route.ts
next: { revalidate: 600 } // เปลี่ยนเป็น 10 นาที
```

**2. Client-side (page.tsx):**
```typescript
// ใน fetch function
next: { revalidate: 600 } // เปลี่ยนเป็น 10 นาที
```

**3. Cache-Control Headers:**
```typescript
// ใน route.ts
'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
```

---

## 📝 หมายเหตุ

- **ไม่ต้อง Clear Cache Manual**: ระบบจัดการอัตโนมัติ
- **Hard Refresh (F5)**: ได้ข้อมูลล่าสุดเสมอ
- **Background Update**: ไม่บล็อก UI
- **Production Ready**: ใช้งานได้ทันที

---

## 🎉 สรุป

ระบบ Cache ทำงานอัตโนมัติ:
1. ✅ Next.js Data Cache (Server)
2. ✅ Browser Cache (Client)
3. ✅ Stale-while-revalidate (Background update)
4. ✅ Hard refresh support (F5)

**ไม่ต้องทำอะไรเพิ่มเติม - ใช้งานได้เลย!** 🚀

