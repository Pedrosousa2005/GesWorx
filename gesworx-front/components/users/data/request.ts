import { UserRole } from "@/context/AuthContext";

export const getUsers = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
    });

    if (!res.ok) throw new Error(`Erro ao buscar usuários: ${res.status}`);


    console.log("Usuários obtidos com sucesso:", res);
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};

export const createUserApi = async (user: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      body: JSON.stringify(user),
    });

    if (!res.ok) throw new Error(`Erro ao criar usuário: ${res.status}`);

    const data = await res.json();
    console.log("Usuário criado com sucesso:", data);
    return data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return null;
  }
};
