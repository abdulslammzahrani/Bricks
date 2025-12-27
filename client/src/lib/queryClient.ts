import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // بناء URL من queryKey
    // إذا كان queryKey يحتوي على أكثر من عنصر، الأول هو الـ base URL والباقي هي query parameters
    let url: string;
    if (Array.isArray(queryKey) && queryKey.length > 0) {
      const baseUrl = queryKey[0] as string;
      const params = queryKey.slice(1);
      
      // إذا كان هناك parameters، أضفهم كـ query string
      if (params.length > 0) {
        const queryParams = new URLSearchParams();
        params.forEach((param, index) => {
          // إذا كان param هو object، أضف كل key-value pair
          if (typeof param === 'object' && param !== null) {
            Object.entries(param).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
              }
            });
          } else if (param !== undefined && param !== null) {
            // إذا كان param هو string أو number، استخدم index كـ key أو اسم الـ parameter
            // للـ endpoints التي تحتاج city كـ query parameter
            if (baseUrl.includes('/top-districts') || baseUrl.includes('/analytics')) {
              queryParams.append('city', String(param));
            } else {
              queryParams.append(`param${index}`, String(param));
            }
          }
        });
        url = `${baseUrl}?${queryParams.toString()}`;
      } else {
        url = baseUrl;
      }
    } else {
      url = String(queryKey);
    }
    
    // Logging للـ debugging (يمكن إزالته لاحقاً)
    if (process.env.NODE_ENV === "development") {
      console.log(`[QueryClient] Fetching: ${url}`);
    }

    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        if (process.env.NODE_ENV === "development") {
          console.log(`[QueryClient] Unauthorized (401) for: ${url}`);
        }
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[QueryClient] Success for: ${url}`, data);
      }
      
      return data;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[QueryClient] Error fetching ${url}:`, error);
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // تم تغييرها لـ true لتحديث البيانات عند العودة للمتصفح
      refetchOnMount: true, // إضافة refetchOnMount لضمان جلب البيانات عند تحميل الصفحة
      staleTime: 0, // تم التغيير من Infinity إلى 0 لضمان جلب البيانات الجديدة فوراً
      retry: 1, // إضافة retry مرة واحدة بدلاً من false
      retryDelay: 1000, // انتظار ثانية واحدة قبل إعادة المحاولة
    },
    mutations: {
      retry: false,
    },
  },
});