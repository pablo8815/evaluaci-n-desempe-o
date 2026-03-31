import { NextResponse } from "next/server";

export const runtime = "nodejs";

type EmployeeRow = {
  id: string;
  nombre: string;
  puesto: string;
  area: string;
  email?: string;
};

type GraphTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type SharePointListItem = {
  id?: string | number;
  fields?: Record<string, unknown>;
};

type SharePointItemsResponse = {
  value?: SharePointListItem[];
};

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function firstField(
  fields: Record<string, unknown>,
  candidates: string[]
): string {
  for (const key of candidates) {
    const value = toText(fields[key]);
    if (value) return value;
  }
  return "";
}

export async function GET() {
  try {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const siteId = process.env.SHAREPOINT_SITE_ID;
    const listId = process.env.SHAREPOINT_PERSONAL_LIST_ID;

    if (!tenantId || !clientId || !clientSecret || !siteId || !listId) {
      return NextResponse.json(
        {
          error: "Faltan variables de entorno para Azure/SharePoint",
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

    const tokenData =
      (await tokenRes.json().catch(() => null)) as GraphTokenResponse | null;

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

    const spData =
      (await spRes.json().catch(() => null)) as SharePointItemsResponse | null;

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
      .map((item): EmployeeRow => {
        const f = item.fields ?? {};

        const nombre =
          firstField(f, ["Usuario", "Title", "NombreCompleto"]) ||
          `${firstField(f, ["Nombre"])} ${firstField(f, ["Apellido"])}`.trim();

        const puesto = firstField(f, [
          "Puesto",
          "Cargo",
          "jobTitle",
          "JobTitle",
          "Puesto_x0020_del_x0020_trabajo",
        ]);

        const area = firstField(f, [
          "area",
          "Area",
          "AREA",
          "Departamento",
          "departamento",
          "Department",
          "department",
          "Departamento_x0020_o_x0020_direcci_x00f3_n",
          "Area_x0020_de_x0020_trabajo",
          "area_x0020_de_x0020_trabajo",
          "field_3",
          "field_4",
          "field_5",
        ]);

        const email = firstField(f, [
          "Email",
          "Nombreprincipaldeusuario",
          "Nombre_x0020_principal_x0020_de_x0020_usuario",
        ]);

        return {
          id: toText(item.id),
          nombre,
          puesto,
          area,
          email,
        };
      })
      .filter((row) => row.id !== "" && row.nombre !== "")
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    return NextResponse.json({
      data: employees,
      debug: spData?.value?.[0]?.fields ?? {},
    });
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