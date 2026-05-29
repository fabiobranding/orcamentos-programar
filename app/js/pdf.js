/* =============================================
   OrçaMármore — PDF Generator
   Monta HTML idêntico ao layout de referência
   e imprime via window.print()
   ============================================= */

'use strict';

function gerarPDF(orcamento) {
  const empresa = getEmpresa();

  // Paleta de cores baseada na configuração
  const paletas = {
    verde: {
      primaria:    '#1B5E20',
      media:       '#2E7D32',
      clara:       '#E8F5E9',
      destaque:    '#4CAF50',
      fundo:       '#F1F8E9',
      bordaAlt:    '#A5D6A7',
      textoHeader: '#C8E6C9',
    },
    azul: {
      primaria:    '#0D47A1',
      media:       '#1565C0',
      clara:       '#E3F2FD',
      destaque:    '#2196F3',
      fundo:       '#E8F4FD',
      bordaAlt:    '#90CAF9',
      textoHeader: '#BBDEFB',
    },
    grafite: {
      primaria:    '#212121',
      media:       '#37474F',
      clara:       '#ECEFF1',
      destaque:    '#607D8B',
      fundo:       '#F5F5F5',
      bordaAlt:    '#B0BEC5',
      textoHeader: '#CFD8DC',
    },
  };

  const cor = paletas[empresa.corPDF || 'verde'];

  // Número do orçamento formatado para exibição
  const numDisplay = orcamento.numero || '—';

  // Data e validade formatadas
  const dataFmt     = formatData(orcamento.data)     || '—';
  const validadeFmt = formatData(orcamento.validade) || '15 dias';

  // Calcular dias de validade para obs
  let diasValidade = '15 dias';
  if (orcamento.data && orcamento.validade) {
    const d1 = new Date(orcamento.data);
    const d2 = new Date(orcamento.validade);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    diasValidade = `${diff} dias`;
  }

  // Observações com substituição de variável
  const obsLinhas = (empresa.obsOrcamento || []).map(o =>
    o.replace('{{validade}}', diasValidade)
  );

  // Linhas de itens por ambiente
  function buildAmbientes() {
    if (!orcamento.ambientes || !orcamento.ambientes.length) return '';
    let html = '';
    orcamento.ambientes.forEach(amb => {
      // Linha de cabeçalho do ambiente
      html += `
        <tr>
          <td colspan="4" style="
            background:${cor.clara};
            color:${cor.primaria};
            font-weight:700;
            font-size:13px;
            padding:9px 14px;
            letter-spacing:0.5px;
          ">&#9654; ${escapeHtml(amb.nome.toUpperCase())}</td>
        </tr>`;

      // Itens do ambiente (zebra)
      (amb.itens || []).forEach((item, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#FAFAFA';
        html += `
          <tr style="background:${bg}">
            <td style="padding:8px 14px;font-size:13px;border-bottom:1px solid #ECEFF1;">${escapeHtml(item.descricao || '')}</td>
            <td style="padding:8px 14px;font-size:13px;border-bottom:1px solid #ECEFF1;">${escapeHtml(item.dimensoes || '')}</td>
            <td style="padding:8px 14px;font-size:13px;border-bottom:1px solid #ECEFF1;">${escapeHtml(item.quantidade || '')}</td>
            <td style="padding:8px 14px;font-size:13px;border-bottom:1px solid #ECEFF1;">${escapeHtml(item.observacao || '—')}</td>
          </tr>`;
      });
    });
    return html;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Logo
  const logoHtml = empresa.logo
    ? `<img src="${empresa.logo}" style="max-height:60px;max-width:140px;object-fit:contain;margin-right:16px;" alt="Logo">`
    : `<div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:8px;margin-right:16px;display:flex;align-items:center;justify-content:center;font-size:24px;color:rgba(255,255,255,0.7);">&#127968;</div>`;

  // Contatos do header
  const contatosArr = [];
  if (empresa.telefone)  contatosArr.push(`&#128222; ${empresa.telefone}`);
  if (empresa.whatsapp)  contatosArr.push(`&#128241; ${empresa.whatsapp}`);
  if (empresa.instagram) contatosArr.push(`&#128247; @${empresa.instagram.replace('@','')}`);
  if (empresa.endereco)  contatosArr.push(`&#128205; ${empresa.endereco}`);
  const contatosHtml = contatosArr.length
    ? contatosArr.join('&nbsp;&nbsp;|&nbsp;&nbsp;')
    : '&#128222; (00) 00000-0000';

  // Rodapé
  const rodapeArr = [empresa.nome || 'Marmoraria'];
  if (empresa.telefone)  rodapeArr.push(empresa.telefone);
  if (empresa.whatsapp)  rodapeArr.push(empresa.whatsapp);
  if (empresa.instagram) rodapeArr.push('@' + empresa.instagram.replace('@',''));
  const rodapeHtml = rodapeArr.join('&nbsp;&nbsp;|&nbsp;&nbsp;');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Orçamento Nº ${escapeHtml(numDisplay)} — ${escapeHtml(empresa.nome || 'Marmoraria')}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #f5f5f5;
    color: #37474F;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #fff;
    box-shadow: 0 2px 16px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
  }
  @media print {
    body { background: white; }
    .page { box-shadow: none; width: 100%; margin: 0; }
    .no-print { display: none !important; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>

<!-- Botão imprimir (some no print) -->
<div class="no-print" style="text-align:center;padding:16px;background:#f1f8e9;">
  <button onclick="window.print()" style="
    background:${cor.primaria};color:#fff;border:none;
    padding:10px 28px;font-size:15px;font-family:Arial;
    border-radius:6px;cursor:pointer;font-weight:700;
  ">&#128438; Imprimir / Salvar PDF</button>
  <button onclick="window.close()" style="
    background:#90A4AE;color:#fff;border:none;
    padding:10px 20px;font-size:15px;font-family:Arial;
    border-radius:6px;cursor:pointer;font-weight:700;margin-left:10px;
  ">Fechar</button>
</div>

<div class="page">

  <!-- HEADER -->
  <div style="
    background:${cor.primaria};
    padding:22px 28px;
    display:flex;
    align-items:center;
  ">
    ${logoHtml}
    <div>
      <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
        ${escapeHtml((empresa.nome || 'Minha Marmoraria').toUpperCase())}
      </div>
      ${empresa.cnpj ? `<div style="color:${cor.textoHeader};font-size:11px;margin-top:3px;">CNPJ: ${escapeHtml(empresa.cnpj)}</div>` : ''}
      <div style="color:${cor.textoHeader};font-size:12px;margin-top:6px;">
        ${contatosHtml}
      </div>
    </div>
  </div>

  <!-- DIVIDER -->
  <div style="height:4px;background:${cor.destaque};"></div>

  <!-- TÍTULO DO ORÇAMENTO -->
  <div style="text-align:center;padding:18px 28px 12px;">
    <div style="font-size:20px;font-weight:700;color:${cor.primaria};letter-spacing:4px;text-transform:uppercase;">
      O R Ç A M E N T O
    </div>
    <div style="font-size:14px;color:#78909C;margin-top:4px;font-weight:600;">
      Nº ${escapeHtml(numDisplay)}
    </div>
  </div>

  <!-- DADOS DO CLIENTE -->
  <div style="
    margin:0 24px 16px;
    background:${cor.fundo};
    border-left:4px solid ${cor.primaria};
    border-radius:0 6px 6px 0;
    padding:12px 16px;
    display:flex;
    gap:32px;
    flex-wrap:wrap;
  ">
    <div>
      <div style="font-size:10px;font-weight:700;color:#78909C;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Cliente</div>
      <div style="font-size:14px;font-weight:700;color:${cor.primaria};">${escapeHtml(orcamento.cliente || '—')}</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;color:#78909C;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Data</div>
      <div style="font-size:14px;">${dataFmt}</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;color:#78909C;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Validade</div>
      <div style="font-size:14px;">${validadeFmt}</div>
    </div>
  </div>

  <!-- TABELA DE ITENS -->
  <div style="margin:0 24px 16px;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:${cor.primaria};">
          <th style="padding:10px 14px;text-align:left;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Descrição</th>
          <th style="padding:10px 14px;text-align:left;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Dimensões</th>
          <th style="padding:10px 14px;text-align:left;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Qtd</th>
          <th style="padding:10px 14px;text-align:left;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Observação</th>
        </tr>
      </thead>
      <tbody>
        ${buildAmbientes()}
      </tbody>
    </table>
  </div>

  <!-- MATERIAL -->
  <div style="
    margin:0 24px 16px;
    background:${cor.clara};
    border:1.5px solid ${cor.bordaAlt};
    border-radius:6px;
    padding:12px 16px;
  ">
    <span style="font-size:11px;font-weight:700;color:#78909C;text-transform:uppercase;letter-spacing:0.5px;">Material Utilizado:&nbsp;</span>
    <span style="font-size:14px;font-weight:700;color:${cor.primaria};">${escapeHtml(orcamento.material || '—')}</span>
  </div>

  <!-- VALOR TOTAL -->
  <div style="
    margin:0 24px 20px;
    background:${cor.primaria};
    border-radius:6px;
    padding:16px 20px;
    display:flex;
    justify-content:space-between;
    align-items:center;
  ">
    <div style="color:#fff;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
      VALOR TOTAL
    </div>
    <div style="color:#fff;font-size:24px;font-weight:700;">
      ${formatBRL(orcamento.valorTotal || 0)}
    </div>
  </div>

  <!-- OBSERVAÇÕES IMPORTANTES -->
  ${obsLinhas.length ? `
  <div style="margin:0 24px 20px;padding:16px;border:1px solid ${cor.bordaAlt};border-radius:6px;background:${cor.fundo};">
    <div style="font-size:13px;font-weight:700;color:${cor.primaria};margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">
      Observações Importantes:
    </div>
    ${obsLinhas.map((obs, i) => `
      <div style="font-size:12px;color:#546E7A;margin-bottom:6px;padding-left:16px;position:relative;">
        <span style="position:absolute;left:0;color:${cor.destaque};font-weight:700;">${i+1}.</span>
        ${escapeHtml(obs)}
      </div>
    `).join('')}
  </div>` : ''}

  <!-- ASSINATURAS -->
  <div style="margin:0 24px 24px;display:flex;gap:40px;">
    <div style="flex:1;text-align:center;">
      <div style="border-top:2px solid #CFD8DC;padding-top:8px;margin-top:40px;">
        <div style="font-size:12px;font-weight:700;color:#546E7A;">${escapeHtml(empresa.nome || 'Marmoraria')}</div>
        <div style="font-size:11px;color:#90A4AE;">Responsável</div>
      </div>
    </div>
    <div style="flex:1;text-align:center;">
      <div style="border-top:2px solid #CFD8DC;padding-top:8px;margin-top:40px;">
        <div style="font-size:12px;font-weight:700;color:#546E7A;">${escapeHtml(orcamento.cliente || 'Cliente')}</div>
        <div style="font-size:11px;color:#90A4AE;">Contratante</div>
      </div>
    </div>
  </div>

  <!-- RODAPÉ -->
  <div style="
    margin-top:auto;
    background:${cor.primaria};
    padding:12px 28px;
    text-align:center;
    color:${cor.textoHeader};
    font-size:12px;
  ">
    ${rodapeHtml}
  </div>

</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Por favor, permita pop-ups para gerar o PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Pequeno delay para garantir que imagens carreguem
  setTimeout(() => win.print(), 800);
}
