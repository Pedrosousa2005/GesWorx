import { UserRole } from "@/context/AuthContext";

export const getVans = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/vans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
    });

    if (!res.ok) throw new Error(`Erro ao buscar vans: ${res.status}`);

    console.log("Vans obtidos com sucesso:", res);
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};

export const createVansApi = async (van: {
  licensePlate: string;
}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/vans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      body: JSON.stringify(van),
    });

    if (!res.ok) throw new Error(`Erro ao criar van: ${res.status}`);

    const data = await res.json();
    console.log("Van criada com sucesso:", data);
    return data;
  } catch (error) {
    console.error("Erro ao criar van:", error);
    return null;
  }
};


export const getVansById = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/vans/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
    });

    if (!res.ok) throw new Error(`Erro ao buscar vans: ${res.status}`);

    console.log("Vans obtidos com sucesso:", res);
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};

export const updateVansById = async (id: string, van: {
  licensePlate: string;
}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/vans/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      body: JSON.stringify(van),
    });

    if (!res.ok) throw new Error(`Erro ao atualizar van: ${res.status}`);

    const data = await res.json();
    console.log("Van atualizada com sucesso:", data);
    return data;
  } catch (error) {
    console.error("Erro ao atualizar van:", error);
    return null;
  }
};

export const deleteVansById = async (id: string ) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/vans/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
    });

    if (!res.ok) throw new Error(`Erro ao deletar van: ${res.status}`);

    const data = await res.json();
    console.log("Van deletada com sucesso:", data);
    return data;
  } catch (error) {
    console.error("Erro ao deletar van:", error);
    return null;
  }
};
