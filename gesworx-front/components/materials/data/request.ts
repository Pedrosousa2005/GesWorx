import { UserRole } from "@/context/AuthContext";

export const getMaterials = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/materials`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
        });

        if (!res.ok) throw new Error(`Erro ao buscar materiais: ${res.status}`);

        console.log("Materiais obtidos com sucesso:", res);
        return await res.json();
    } catch (error) {
        console.error("Erro ao buscar materiais:", error);
        return [];
    }
};

export const createMaterialsApi = async (material: {
    name: string;
    category: string;
    subcategory: string | null;
    parentId?: number | null;
    vanId?: number | null;
}) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/materials`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify(material),
        });

        if (!res.ok) throw new Error(`Erro ao criar material: ${res.status}`);

        const data = await res.json();
        console.log("Material criado com sucesso:", data);
        return data;
    } catch (error) {
        console.error("Erro ao criar material:", error);
        return null;
    }
};


export const getMaterialById = async (id: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/materials/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
        });

        if (!res.ok) throw new Error(`Erro ao buscar materiais: ${res.status}`);

        console.log("Materiais obtidos com sucesso:", res);
        return await res.json();
    } catch (error) {
        console.error("Erro ao buscar materiais:", error);
        return [];
    }
};

export const updateMaterialsById = async (id: string, material: {
    name: string;
    category: string;
    subcategory: string | null;
    parentId?: number | null;
    vanId?: number | null;
}) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/materials/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify(material),
        });

        if (!res.ok) throw new Error(`Erro ao atualizar material: ${res.status}`);

        const data = await res.json();
        console.log("Material atualizado com sucesso:", data);
        return data;
    } catch (error) {
        console.error("Erro ao atualizar material:", error);
        return null;
    }
};

export const deleteMaterialsById = async (id: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/materials/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
        });

        if (!res.ok) throw new Error(`Erro ao deletar material: ${res.status}`);

        const data = await res.json();
        console.log("Material deletado com sucesso:", data);
        return data;
    } catch (error) {
        console.error("Erro ao deletar material:", error);
        return null;
    }
};


export const getCategories = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/materials/categories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
        });

        if (!res.ok) throw new Error(`Erro ao buscar categorias: ${res.status}`);

        console.log("Categorias obtidas com sucesso:", res);
        return await res.json();
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return [];
    }
};