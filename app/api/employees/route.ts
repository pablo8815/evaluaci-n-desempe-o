import { NextResponse } from "next/server";

export const runtime = "nodejs";

type EmployeeRow = {
  id: string;
  nombre: string;
  puesto: string;
  area: string;
  email?: string;
};

export async function GET() {
  try {
    const tenantId = process.env.AZURE_TENANT_ID!;
    const clientId = process.env.AZURE_CLIENT_ID!;
    const clientSecret = process.env.AZURE_CLIENT_SECRET!;
    const siteId = process.env.SHAREPOINT_SITE_ID!;
    const listId = process.env.SHAREPOINT_PERSONAL_LIST_ID!;

    if (!tenantId || !clientId || !clientSecret || !siteId || !listId) {
      return NextResponse.json(
        {
          error: "Faltan variables de entorno para Azure/SharePoint",
          hasTenant: !!tenantId,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          hasSiteId: !!siteId,
          hasListId: !!listId,
        },
        { status: 500 }
      );
    }

    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
        cache: "no-store",
      }
    );

    const tokenData = await tokenRes.json().catch(() => null);

    if (!tokenRes.ok || !tokenData?.access_token) {
      return NextResponse.json(
        {
          error: "No se pudo obtener el token de Microsoft Graph",
          details: tokenData,
        },
        { status: 500 }
      );
    }

    const spRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        cache: "no-store",
      }
    );

    const spData = await spRes.json().catch(() => null);

    if (!spRes.ok) {
      return NextResponse.json(
        {
          error: "No se pudo leer la lista de SharePoint",
          details: spData,
        },
        { status: 500 }
      );
    }

    const employees: EmployeeRow[] = (spData?.value ?? [])
      .map((item: any) => {
        const f = item.fields ?? {};

        return {
          id: String(item.id ?? ""),
          nombre: String(
            f.Usuario ??
              f.Title ??
              `${f.Nombre ?? ""} ${f.Apellido ?? ""}`.trim() ??
              ""
          ),
          puesto: String(f.Puesto ?? f.Cargo ?? ""),
          area: String(f.Departamento ?? f.Area ?? ""),
          email: String(f.Email ?? f.Nombreprincipaldeusuario ?? ""),
        };
      })
      .filter((row: EmployeeRow) => row.id && row.nombre)
      .sort((a: EmployeeRow, b: EmployeeRow) =>
        a.nombre.localeCompare(b.nombre, "es")
      );

    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}