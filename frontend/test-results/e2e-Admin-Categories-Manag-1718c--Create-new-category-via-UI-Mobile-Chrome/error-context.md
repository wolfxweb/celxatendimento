# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Admin Categories Management >> CAT-E2E-002: Create new category via UI
- Location: tests/e2e.spec.ts:326:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /nova categoria/i })
    - locator resolved to <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-glow-primary transition-all">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <input value="" type="text" placeholder="Buscar categoria..." class="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"/> from <div class="relative">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <input value="" type="text" placeholder="Buscar categoria..." class="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"/> from <div class="relative">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <span class="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-violet-100 text-violet-700">admin</span> from <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">…</header> subtree intercepts pointer events
  12 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="flex items-center gap-2 sm:gap-4 shrink-0">…</div> from <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">…</header> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <input value="" type="text" placeholder="Buscar categoria..." class="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"/> from <div class="relative">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <input value="" type="text" placeholder="Buscar categoria..." class="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"/> from <div class="relative">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="flex items-center gap-2 sm:gap-4 shrink-0">…</div> from <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">…</header> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="flex items-center gap-2 sm:gap-4 shrink-0">…</div> from <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">…</header> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <input value="" type="text" placeholder="Buscar categoria..." class="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"/> from <div class="relative">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e7]: C
      - navigation [ref=e8]:
        - link "🏠" [ref=e9] [cursor=pointer]:
          - /url: /dashboard
          - generic [ref=e10]: 🏠
        - link "🎫" [ref=e11] [cursor=pointer]:
          - /url: /dashboard/cliente/tickets
          - generic [ref=e12]: 🎫
        - link "📋" [ref=e13] [cursor=pointer]:
          - /url: /dashboard/atendente/tickets
          - generic [ref=e14]: 📋
        - link "🤖" [ref=e15] [cursor=pointer]:
          - /url: /dashboard/atendente/aprovacao
          - generic [ref=e16]: 🤖
        - link "👥" [ref=e17] [cursor=pointer]:
          - /url: /dashboard/admin/usuarios
          - generic [ref=e18]: 👥
        - link "📁" [ref=e19] [cursor=pointer]:
          - /url: /dashboard/admin/categorias
          - generic [ref=e20]: 📁
        - link "⚙️" [ref=e21] [cursor=pointer]:
          - /url: /dashboard/admin/config-ia
          - generic [ref=e22]: ⚙️
        - link "📚" [ref=e23] [cursor=pointer]:
          - /url: /dashboard/admin/conhecimento
          - generic [ref=e24]: 📚
      - generic [ref=e28]: A
    - generic [ref=e29]:
      - banner [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - button "Abrir menu" [ref=e33] [cursor=pointer]:
              - img [ref=e34]
            - generic [ref=e36]:
              - heading "Olá, Administrador 👋" [level=2] [ref=e37]
              - paragraph [ref=e38]: domingo, 26 de abril
          - generic [ref=e39]:
            - generic [ref=e40]: admin
            - button "🔔" [ref=e41] [cursor=pointer]: 🔔
      - main [ref=e43]:
        - generic [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e47]:
              - heading "Categorias" [level=1] [ref=e48]
              - paragraph [ref=e49]: Gerencie as categorias da sua empresa
            - generic [ref=e50]:
              - generic [ref=e51]:
                - textbox "Buscar categoria..." [ref=e52]
                - generic [ref=e53]: 🔍
              - button "➕ Nova Categoria" [ref=e54] [cursor=pointer]:
                - generic [ref=e55]: ➕
                - text: Nova Categoria
          - generic [ref=e56]:
            - generic [ref=e58]:
              - generic [ref=e59]:
                - generic [ref=e60]: 📁
                - generic [ref=e61]:
                  - generic [ref=e62]:
                    - heading "Categoria Ativa para Inativar E2E 1777226155052" [level=3] [ref=e63]
                    - generic [ref=e64]: 🟢 Ativa
                  - generic [ref=e65]:
                    - generic [ref=e66]:
                      - generic [ref=e67]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e68]:
                      - generic [ref=e69]: 🎫
                      - text: 0 tickets
                    - generic [ref=e70]: Categoria de teste E2E 1777226157699
              - generic [ref=e71]:
                - button "✏️" [ref=e72] [cursor=pointer]
                - button "⛔" [ref=e73] [cursor=pointer]
                - button "🗑️" [ref=e74] [cursor=pointer]
            - generic [ref=e76]:
              - generic [ref=e77]:
                - generic [ref=e78]: 📁
                - generic [ref=e79]:
                  - generic [ref=e80]:
                    - heading "Categoria Ativa para Inativar E2E 1777226215173" [level=3] [ref=e81]
                    - generic [ref=e82]: 🟢 Ativa
                  - generic [ref=e83]:
                    - generic [ref=e84]:
                      - generic [ref=e85]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e86]:
                      - generic [ref=e87]: 🎫
                      - text: 0 tickets
                    - generic [ref=e88]: Categoria de teste E2E 1777226216092
              - generic [ref=e89]:
                - button "✏️" [ref=e90] [cursor=pointer]
                - button "⛔" [ref=e91] [cursor=pointer]
                - button "🗑️" [ref=e92] [cursor=pointer]
            - generic [ref=e94]:
              - generic [ref=e95]:
                - generic [ref=e96]: 📁
                - generic [ref=e97]:
                  - generic [ref=e98]:
                    - heading "Categoria Ativa para Inativar E2E 1777226364286" [level=3] [ref=e99]
                    - generic [ref=e100]: 🟢 Ativa
                  - generic [ref=e101]:
                    - generic [ref=e102]:
                      - generic [ref=e103]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e104]:
                      - generic [ref=e105]: 🎫
                      - text: 0 tickets
                    - generic [ref=e106]: Categoria de teste E2E 1777226364884
              - generic [ref=e107]:
                - button "✏️" [ref=e108] [cursor=pointer]
                - button "⛔" [ref=e109] [cursor=pointer]
                - button "🗑️" [ref=e110] [cursor=pointer]
            - generic [ref=e112]:
              - generic [ref=e113]:
                - generic [ref=e114]: 📁
                - generic [ref=e115]:
                  - generic [ref=e116]:
                    - heading "Categoria Ativa para Inativar E2E 1777226528044" [level=3] [ref=e117]
                    - generic [ref=e118]: 🟢 Ativa
                  - generic [ref=e119]:
                    - generic [ref=e120]:
                      - generic [ref=e121]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e122]:
                      - generic [ref=e123]: 🎫
                      - text: 0 tickets
                    - generic [ref=e124]: Categoria de teste E2E 1777226528639
              - generic [ref=e125]:
                - button "✏️" [ref=e126] [cursor=pointer]
                - button "⛔" [ref=e127] [cursor=pointer]
                - button "🗑️" [ref=e128] [cursor=pointer]
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]: 📁
                - generic [ref=e133]:
                  - generic [ref=e134]:
                    - heading "Categoria Ativa para Inativar E2E 1777226941743" [level=3] [ref=e135]
                    - generic [ref=e136]: 🟢 Ativa
                  - generic [ref=e137]:
                    - generic [ref=e138]:
                      - generic [ref=e139]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e140]:
                      - generic [ref=e141]: 🎫
                      - text: 0 tickets
                    - generic [ref=e142]: Categoria de teste E2E 1777226942416
              - generic [ref=e143]:
                - button "✏️" [ref=e144] [cursor=pointer]
                - button "⛔" [ref=e145] [cursor=pointer]
                - button "🗑️" [ref=e146] [cursor=pointer]
            - generic [ref=e148]:
              - generic [ref=e149]:
                - generic [ref=e150]: 📁
                - generic [ref=e151]:
                  - generic [ref=e152]:
                    - heading "Categoria Ativa para Inativar E2E 1777227079021" [level=3] [ref=e153]
                    - generic [ref=e154]: 🟢 Ativa
                  - generic [ref=e155]:
                    - generic [ref=e156]:
                      - generic [ref=e157]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e158]:
                      - generic [ref=e159]: 🎫
                      - text: 0 tickets
                    - generic [ref=e160]: Categoria de teste E2E 1777227079841
              - generic [ref=e161]:
                - button "✏️" [ref=e162] [cursor=pointer]
                - button "⛔" [ref=e163] [cursor=pointer]
                - button "🗑️" [ref=e164] [cursor=pointer]
            - generic [ref=e166]:
              - generic [ref=e167]:
                - generic [ref=e168]: 📁
                - generic [ref=e169]:
                  - generic [ref=e170]:
                    - heading "Categoria Ativar E2E 1777227231490" [level=3] [ref=e171]
                    - generic [ref=e172]: 🟢 Ativa
                  - generic [ref=e173]:
                    - generic [ref=e174]:
                      - generic [ref=e175]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e176]:
                      - generic [ref=e177]: 🎫
                      - text: 0 tickets
                    - generic [ref=e178]: Test
              - generic [ref=e179]:
                - button "✏️" [ref=e180] [cursor=pointer]
                - button "⛔" [ref=e181] [cursor=pointer]
                - button "🗑️" [ref=e182] [cursor=pointer]
            - generic [ref=e184]:
              - generic [ref=e185]:
                - generic [ref=e186]: 📁
                - generic [ref=e187]:
                  - generic [ref=e188]:
                    - heading "Categoria Busca E2E 1777226174474" [level=3] [ref=e189]
                    - generic [ref=e190]: 🟢 Ativa
                  - generic [ref=e191]:
                    - generic [ref=e192]:
                      - generic [ref=e193]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e194]:
                      - generic [ref=e195]: 🎫
                      - text: 0 tickets
                    - generic [ref=e196]: Categoria de teste E2E 1777226175288
              - generic [ref=e197]:
                - button "✏️" [ref=e198] [cursor=pointer]
                - button "⛔" [ref=e199] [cursor=pointer]
                - button "🗑️" [ref=e200] [cursor=pointer]
            - generic [ref=e202]:
              - generic [ref=e203]:
                - generic [ref=e204]: 📁
                - generic [ref=e205]:
                  - generic [ref=e206]:
                    - heading "Categoria Busca E2E 1777226231685" [level=3] [ref=e207]
                    - generic [ref=e208]: 🟢 Ativa
                  - generic [ref=e209]:
                    - generic [ref=e210]:
                      - generic [ref=e211]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e212]:
                      - generic [ref=e213]: 🎫
                      - text: 0 tickets
                    - generic [ref=e214]: Categoria de teste E2E 1777226232334
              - generic [ref=e215]:
                - button "✏️" [ref=e216] [cursor=pointer]
                - button "⛔" [ref=e217] [cursor=pointer]
                - button "🗑️" [ref=e218] [cursor=pointer]
            - generic [ref=e220]:
              - generic [ref=e221]:
                - generic [ref=e222]: 📁
                - generic [ref=e223]:
                  - generic [ref=e224]:
                    - heading "Categoria Busca E2E 1777226424504" [level=3] [ref=e225]
                    - generic [ref=e226]: 🟢 Ativa
                  - generic [ref=e227]:
                    - generic [ref=e228]:
                      - generic [ref=e229]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e230]:
                      - generic [ref=e231]: 🎫
                      - text: 0 tickets
                    - generic [ref=e232]: Categoria de teste E2E 1777226425146
              - generic [ref=e233]:
                - button "✏️" [ref=e234] [cursor=pointer]
                - button "⛔" [ref=e235] [cursor=pointer]
                - button "🗑️" [ref=e236] [cursor=pointer]
            - generic [ref=e238]:
              - generic [ref=e239]:
                - generic [ref=e240]: 📁
                - generic [ref=e241]:
                  - generic [ref=e242]:
                    - heading "Categoria Busca E2E 1777226623959" [level=3] [ref=e243]
                    - generic [ref=e244]: 🟢 Ativa
                  - generic [ref=e245]:
                    - generic [ref=e246]:
                      - generic [ref=e247]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e248]:
                      - generic [ref=e249]: 🎫
                      - text: 0 tickets
                    - generic [ref=e250]: Categoria de teste E2E 1777226624579
              - generic [ref=e251]:
                - button "✏️" [ref=e252] [cursor=pointer]
                - button "⛔" [ref=e253] [cursor=pointer]
                - button "🗑️" [ref=e254] [cursor=pointer]
            - generic [ref=e256]:
              - generic [ref=e257]:
                - generic [ref=e258]: 📁
                - generic [ref=e259]:
                  - generic [ref=e260]:
                    - heading "Categoria Busca E2E 1777227004852" [level=3] [ref=e261]
                    - generic [ref=e262]: 🟢 Ativa
                  - generic [ref=e263]:
                    - generic [ref=e264]:
                      - generic [ref=e265]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e266]:
                      - generic [ref=e267]: 🎫
                      - text: 0 tickets
                    - generic [ref=e268]: Categoria de teste E2E 1777227005513
              - generic [ref=e269]:
                - button "✏️" [ref=e270] [cursor=pointer]
                - button "⛔" [ref=e271] [cursor=pointer]
                - button "🗑️" [ref=e272] [cursor=pointer]
            - generic [ref=e274]:
              - generic [ref=e275]:
                - generic [ref=e276]: 📁
                - generic [ref=e277]:
                  - generic [ref=e278]:
                    - heading "Categoria Deletar E2E 1777227247034" [level=3] [ref=e279]
                    - generic [ref=e280]: 🟢 Ativa
                  - generic [ref=e281]:
                    - generic [ref=e282]:
                      - generic [ref=e283]: ⏱️
                      - text: "SLA: 1 dia"
                    - generic [ref=e284]:
                      - generic [ref=e285]: 🎫
                      - text: 0 tickets
              - generic [ref=e286]:
                - button "✏️" [ref=e287] [cursor=pointer]
                - button "⛔" [ref=e288] [cursor=pointer]
                - button "🗑️" [ref=e289] [cursor=pointer]
            - generic [ref=e291]:
              - generic [ref=e292]:
                - generic [ref=e293]: 📁
                - generic [ref=e294]:
                  - generic [ref=e295]:
                    - heading "Categoria Inativa E2E 1777226155342" [level=3] [ref=e296]
                    - generic [ref=e297]: 🟢 Ativa
                  - generic [ref=e298]:
                    - generic [ref=e299]:
                      - generic [ref=e300]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e301]:
                      - generic [ref=e302]: 🎫
                      - text: 0 tickets
                    - generic [ref=e303]: Categoria de teste E2E 1777226157530
              - generic [ref=e304]:
                - button "✏️" [ref=e305] [cursor=pointer]
                - button "⛔" [ref=e306] [cursor=pointer]
                - button "🗑️" [ref=e307] [cursor=pointer]
            - generic [ref=e309]:
              - generic [ref=e310]:
                - generic [ref=e311]: 📁
                - generic [ref=e312]:
                  - generic [ref=e313]:
                    - heading "Categoria Inativa E2E 1777226217969" [level=3] [ref=e314]
                    - generic [ref=e315]: 🟢 Ativa
                  - generic [ref=e316]:
                    - generic [ref=e317]:
                      - generic [ref=e318]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e319]:
                      - generic [ref=e320]: 🎫
                      - text: 0 tickets
                    - generic [ref=e321]: Categoria de teste E2E 1777226219279
              - generic [ref=e322]:
                - button "✏️" [ref=e323] [cursor=pointer]
                - button "⛔" [ref=e324] [cursor=pointer]
                - button "🗑️" [ref=e325] [cursor=pointer]
            - generic [ref=e327]:
              - generic [ref=e328]:
                - generic [ref=e329]: 📁
                - generic [ref=e330]:
                  - generic [ref=e331]:
                    - heading "Categoria Inativa E2E 1777226349601" [level=3] [ref=e332]
                    - generic [ref=e333]: 🟢 Ativa
                  - generic [ref=e334]:
                    - generic [ref=e335]:
                      - generic [ref=e336]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e337]:
                      - generic [ref=e338]: 🎫
                      - text: 0 tickets
                    - generic [ref=e339]: Categoria de teste E2E 1777226350197
              - generic [ref=e340]:
                - button "✏️" [ref=e341] [cursor=pointer]
                - button "⛔" [ref=e342] [cursor=pointer]
                - button "🗑️" [ref=e343] [cursor=pointer]
            - generic [ref=e345]:
              - generic [ref=e346]:
                - generic [ref=e347]: 📁
                - generic [ref=e348]:
                  - generic [ref=e349]:
                    - heading "Categoria Inativa E2E 1777226494302" [level=3] [ref=e350]
                    - generic [ref=e351]: 🟢 Ativa
                  - generic [ref=e352]:
                    - generic [ref=e353]:
                      - generic [ref=e354]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e355]:
                      - generic [ref=e356]: 🎫
                      - text: 0 tickets
                    - generic [ref=e357]: Categoria de teste E2E 1777226494990
              - generic [ref=e358]:
                - button "✏️" [ref=e359] [cursor=pointer]
                - button "⛔" [ref=e360] [cursor=pointer]
                - button "🗑️" [ref=e361] [cursor=pointer]
            - generic [ref=e363]:
              - generic [ref=e364]:
                - generic [ref=e365]: 📁
                - generic [ref=e366]:
                  - generic [ref=e367]:
                    - heading "Categoria Inativa E2E 1777226924372" [level=3] [ref=e368]
                    - generic [ref=e369]: 🟢 Ativa
                  - generic [ref=e370]:
                    - generic [ref=e371]:
                      - generic [ref=e372]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e373]:
                      - generic [ref=e374]: 🎫
                      - text: 0 tickets
                    - generic [ref=e375]: Categoria de teste E2E 1777226925429
              - generic [ref=e376]:
                - button "✏️" [ref=e377] [cursor=pointer]
                - button "⛔" [ref=e378] [cursor=pointer]
                - button "🗑️" [ref=e379] [cursor=pointer]
            - generic [ref=e381]:
              - generic [ref=e382]:
                - generic [ref=e383]: 📁
                - generic [ref=e384]:
                  - generic [ref=e385]:
                    - heading "Categoria Inativa E2E 1777227046367" [level=3] [ref=e386]
                    - generic [ref=e387]: 🟢 Ativa
                  - generic [ref=e388]:
                    - generic [ref=e389]:
                      - generic [ref=e390]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e391]:
                      - generic [ref=e392]: 🎫
                      - text: 0 tickets
                    - generic [ref=e393]: Categoria de teste E2E 1777227047067
              - generic [ref=e394]:
                - button "✏️" [ref=e395] [cursor=pointer]
                - button "⛔" [ref=e396] [cursor=pointer]
                - button "🗑️" [ref=e397] [cursor=pointer]
            - generic [ref=e399]:
              - generic [ref=e400]:
                - generic [ref=e401]: 📁
                - generic [ref=e402]:
                  - generic [ref=e403]:
                    - heading "Categoria Inativa para Ativar E2E 1777226159879" [level=3] [ref=e404]
                    - generic [ref=e405]: 🟢 Ativa
                  - generic [ref=e406]:
                    - generic [ref=e407]:
                      - generic [ref=e408]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e409]:
                      - generic [ref=e410]: 🎫
                      - text: 0 tickets
                    - generic [ref=e411]: Categoria de teste E2E 1777226161039
              - generic [ref=e412]:
                - button "✏️" [ref=e413] [cursor=pointer]
                - button "⛔" [ref=e414] [cursor=pointer]
                - button "🗑️" [ref=e415] [cursor=pointer]
            - generic [ref=e417]:
              - generic [ref=e418]:
                - generic [ref=e419]: 📁
                - generic [ref=e420]:
                  - generic [ref=e421]:
                    - heading "Categoria Inativa para Ativar E2E 1777226218101" [level=3] [ref=e422]
                    - generic [ref=e423]: 🟢 Ativa
                  - generic [ref=e424]:
                    - generic [ref=e425]:
                      - generic [ref=e426]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e427]:
                      - generic [ref=e428]: 🎫
                      - text: 0 tickets
                    - generic [ref=e429]: Categoria de teste E2E 1777226219132
              - generic [ref=e430]:
                - button "✏️" [ref=e431] [cursor=pointer]
                - button "⛔" [ref=e432] [cursor=pointer]
                - button "🗑️" [ref=e433] [cursor=pointer]
            - generic [ref=e435]:
              - generic [ref=e436]:
                - generic [ref=e437]: 📁
                - generic [ref=e438]:
                  - generic [ref=e439]:
                    - heading "Categoria Inativa para Ativar E2E 1777226378650" [level=3] [ref=e440]
                    - generic [ref=e441]: 🟢 Ativa
                  - generic [ref=e442]:
                    - generic [ref=e443]:
                      - generic [ref=e444]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e445]:
                      - generic [ref=e446]: 🎫
                      - text: 0 tickets
                    - generic [ref=e447]: Categoria de teste E2E 1777226379260
              - generic [ref=e448]:
                - button "✏️" [ref=e449] [cursor=pointer]
                - button "⛔" [ref=e450] [cursor=pointer]
                - button "🗑️" [ref=e451] [cursor=pointer]
            - generic [ref=e453]:
              - generic [ref=e454]:
                - generic [ref=e455]: 📁
                - generic [ref=e456]:
                  - generic [ref=e457]:
                    - heading "Categoria Inativa para Ativar E2E 1777226559211" [level=3] [ref=e458]
                    - generic [ref=e459]: 🟢 Ativa
                  - generic [ref=e460]:
                    - generic [ref=e461]:
                      - generic [ref=e462]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e463]:
                      - generic [ref=e464]: 🎫
                      - text: 0 tickets
                    - generic [ref=e465]: Categoria de teste E2E 1777226559837
              - generic [ref=e466]:
                - button "✏️" [ref=e467] [cursor=pointer]
                - button "⛔" [ref=e468] [cursor=pointer]
                - button "🗑️" [ref=e469] [cursor=pointer]
            - generic [ref=e471]:
              - generic [ref=e472]:
                - generic [ref=e473]: 📁
                - generic [ref=e474]:
                  - generic [ref=e475]:
                    - heading "Categoria Inativa para Ativar E2E 1777226957877" [level=3] [ref=e476]
                    - generic [ref=e477]: 🟢 Ativa
                  - generic [ref=e478]:
                    - generic [ref=e479]:
                      - generic [ref=e480]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e481]:
                      - generic [ref=e482]: 🎫
                      - text: 0 tickets
                    - generic [ref=e483]: Categoria de teste E2E 1777226958567
              - generic [ref=e484]:
                - button "✏️" [ref=e485] [cursor=pointer]
                - button "⛔" [ref=e486] [cursor=pointer]
                - button "🗑️" [ref=e487] [cursor=pointer]
            - generic [ref=e489]:
              - generic [ref=e490]:
                - generic [ref=e491]: 📁
                - generic [ref=e492]:
                  - generic [ref=e493]:
                    - heading "Categoria Inativar E2E 1777227198782" [level=3] [ref=e494]
                    - generic [ref=e495]: 🟢 Ativa
                  - generic [ref=e496]:
                    - generic [ref=e497]:
                      - generic [ref=e498]: ⏱️
                      - text: "SLA: 1 dia"
                    - generic [ref=e499]:
                      - generic [ref=e500]: 🎫
                      - text: 0 tickets
              - generic [ref=e501]:
                - button "✏️" [ref=e502] [cursor=pointer]
                - button "⛔" [ref=e503] [cursor=pointer]
                - button "🗑️" [ref=e504] [cursor=pointer]
            - generic [ref=e506]:
              - generic [ref=e507]:
                - generic [ref=e508]: 📁
                - generic [ref=e509]:
                  - generic [ref=e510]:
                    - heading "Categoria Para Editar E2E 1777227166989" [level=3] [ref=e511]
                    - generic [ref=e512]: 🟢 Ativa
                  - generic [ref=e513]:
                    - generic [ref=e514]:
                      - generic [ref=e515]: ⏱️
                      - text: "SLA: 1 dia"
                    - generic [ref=e516]:
                      - generic [ref=e517]: 🎫
                      - text: 0 tickets
                    - generic [ref=e518]: Descrição original
              - generic [ref=e519]:
                - button "✏️" [ref=e520] [cursor=pointer]
                - button "⛔" [ref=e521] [cursor=pointer]
                - button "🗑️" [ref=e522] [cursor=pointer]
            - generic [ref=e524]:
              - generic [ref=e525]:
                - generic [ref=e526]: 📁
                - generic [ref=e527]:
                  - generic [ref=e528]:
                    - heading "Categoria Teste E2E 1777226149045" [level=3] [ref=e529]
                    - generic [ref=e530]: 🟢 Ativa
                  - generic [ref=e531]:
                    - generic [ref=e532]:
                      - generic [ref=e533]: ⏱️
                      - text: "SLA: 2 horas"
                    - generic [ref=e534]:
                      - generic [ref=e535]: 🎫
                      - text: 0 tickets
                    - generic [ref=e536]: Descrição da categoria de teste
              - generic [ref=e537]:
                - button "✏️" [ref=e538] [cursor=pointer]
                - button "⛔" [ref=e539] [cursor=pointer]
                - button "🗑️" [ref=e540] [cursor=pointer]
            - generic [ref=e542]:
              - generic [ref=e543]:
                - generic [ref=e544]: 📁
                - generic [ref=e545]:
                  - generic [ref=e546]:
                    - heading "Categoria Teste E2E 1777226211582" [level=3] [ref=e547]
                    - generic [ref=e548]: 🟢 Ativa
                  - generic [ref=e549]:
                    - generic [ref=e550]:
                      - generic [ref=e551]: ⏱️
                      - text: "SLA: 2 horas"
                    - generic [ref=e552]:
                      - generic [ref=e553]: 🎫
                      - text: 0 tickets
                    - generic [ref=e554]: Descrição da categoria de teste
              - generic [ref=e555]:
                - button "✏️" [ref=e556] [cursor=pointer]
                - button "⛔" [ref=e557] [cursor=pointer]
                - button "🗑️" [ref=e558] [cursor=pointer]
            - generic [ref=e560]:
              - generic [ref=e561]:
                - generic [ref=e562]: 📁
                - generic [ref=e563]:
                  - generic [ref=e564]:
                    - heading "Categoria Teste E2E 999" [level=3] [ref=e565]
                    - generic [ref=e566]: 🟢 Ativa
                  - generic [ref=e567]:
                    - generic [ref=e568]:
                      - generic [ref=e569]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e570]:
                      - generic [ref=e571]: 🎫
                      - text: 0 tickets
                    - generic [ref=e572]: Teste
              - generic [ref=e573]:
                - button "✏️" [ref=e574] [cursor=pointer]
                - button "⛔" [ref=e575] [cursor=pointer]
                - button "🗑️" [ref=e576] [cursor=pointer]
            - generic [ref=e578]:
              - generic [ref=e579]:
                - generic [ref=e580]: 📁
                - generic [ref=e581]:
                  - generic [ref=e582]:
                    - heading "Categoria UI E2E 1777227161570" [level=3] [ref=e583]
                    - generic [ref=e584]: 🟢 Ativa
                  - generic [ref=e585]:
                    - generic [ref=e586]:
                      - generic [ref=e587]: ⏱️
                      - text: "SLA: 2 horas"
                    - generic [ref=e588]:
                      - generic [ref=e589]: 🎫
                      - text: 0 tickets
                    - generic [ref=e590]: Descrição da categoria de teste
              - generic [ref=e591]:
                - button "✏️" [ref=e592] [cursor=pointer]
                - button "⛔" [ref=e593] [cursor=pointer]
                - button "🗑️" [ref=e594] [cursor=pointer]
            - generic [ref=e596]:
              - generic [ref=e597]:
                - generic [ref=e598]: 📁
                - generic [ref=e599]:
                  - generic [ref=e600]:
                    - heading "Categoria UI E2E 1777227373955" [level=3] [ref=e601]
                    - generic [ref=e602]: 🟢 Ativa
                  - generic [ref=e603]:
                    - generic [ref=e604]:
                      - generic [ref=e605]: ⏱️
                      - text: "SLA: 2 horas"
                    - generic [ref=e606]:
                      - generic [ref=e607]: 🎫
                      - text: 0 tickets
                    - generic [ref=e608]: Descrição da categoria de teste
              - generic [ref=e609]:
                - button "✏️" [ref=e610] [cursor=pointer]
                - button "⛔" [ref=e611] [cursor=pointer]
                - button "🗑️" [ref=e612] [cursor=pointer]
            - generic [ref=e614]:
              - generic [ref=e615]:
                - generic [ref=e616]: 📁
                - generic [ref=e617]:
                  - generic [ref=e618]:
                    - heading "Categoria UI E2E 1777227511235" [level=3] [ref=e619]
                    - generic [ref=e620]: 🟢 Ativa
                  - generic [ref=e621]:
                    - generic [ref=e622]:
                      - generic [ref=e623]: ⏱️
                      - text: "SLA: 2 horas"
                    - generic [ref=e624]:
                      - generic [ref=e625]: 🎫
                      - text: 0 tickets
                    - generic [ref=e626]: Descrição da categoria de teste
              - generic [ref=e627]:
                - button "✏️" [ref=e628] [cursor=pointer]
                - button "⛔" [ref=e629] [cursor=pointer]
                - button "🗑️" [ref=e630] [cursor=pointer]
            - generic [ref=e632]:
              - generic [ref=e633]:
                - generic [ref=e634]: 📁
                - generic [ref=e635]:
                  - generic [ref=e636]:
                    - heading "Categoria para Deletar E2E 1777226167794" [level=3] [ref=e637]
                    - generic [ref=e638]: 🟢 Ativa
                  - generic [ref=e639]:
                    - generic [ref=e640]:
                      - generic [ref=e641]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e642]:
                      - generic [ref=e643]: 🎫
                      - text: 0 tickets
                    - generic [ref=e644]: Categoria de teste E2E 1777226169024
              - generic [ref=e645]:
                - button "✏️" [ref=e646] [cursor=pointer]
                - button "⛔" [ref=e647] [cursor=pointer]
                - button "🗑️" [ref=e648] [cursor=pointer]
            - generic [ref=e650]:
              - generic [ref=e651]:
                - generic [ref=e652]: 📁
                - generic [ref=e653]:
                  - generic [ref=e654]:
                    - heading "Categoria para Deletar E2E 1777226219917" [level=3] [ref=e655]
                    - generic [ref=e656]: 🟢 Ativa
                  - generic [ref=e657]:
                    - generic [ref=e658]:
                      - generic [ref=e659]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e660]:
                      - generic [ref=e661]: 🎫
                      - text: 0 tickets
                    - generic [ref=e662]: Categoria de teste E2E 1777226221039
              - generic [ref=e663]:
                - button "✏️" [ref=e664] [cursor=pointer]
                - button "⛔" [ref=e665] [cursor=pointer]
                - button "🗑️" [ref=e666] [cursor=pointer]
            - generic [ref=e668]:
              - generic [ref=e669]:
                - generic [ref=e670]: 📁
                - generic [ref=e671]:
                  - generic [ref=e672]:
                    - heading "Categoria para Deletar E2E 1777226410012" [level=3] [ref=e673]
                    - generic [ref=e674]: 🟢 Ativa
                  - generic [ref=e675]:
                    - generic [ref=e676]:
                      - generic [ref=e677]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e678]:
                      - generic [ref=e679]: 🎫
                      - text: 0 tickets
                    - generic [ref=e680]: Categoria de teste E2E 1777226410624
              - generic [ref=e681]:
                - button "✏️" [ref=e682] [cursor=pointer]
                - button "⛔" [ref=e683] [cursor=pointer]
                - button "🗑️" [ref=e684] [cursor=pointer]
            - generic [ref=e686]:
              - generic [ref=e687]:
                - generic [ref=e688]: 📁
                - generic [ref=e689]:
                  - generic [ref=e690]:
                    - heading "Categoria para Deletar E2E 1777226591368" [level=3] [ref=e691]
                    - generic [ref=e692]: 🟢 Ativa
                  - generic [ref=e693]:
                    - generic [ref=e694]:
                      - generic [ref=e695]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e696]:
                      - generic [ref=e697]: 🎫
                      - text: 0 tickets
                    - generic [ref=e698]: Categoria de teste E2E 1777226591958
              - generic [ref=e699]:
                - button "✏️" [ref=e700] [cursor=pointer]
                - button "⛔" [ref=e701] [cursor=pointer]
                - button "🗑️" [ref=e702] [cursor=pointer]
            - generic [ref=e704]:
              - generic [ref=e705]:
                - generic [ref=e706]: 📁
                - generic [ref=e707]:
                  - generic [ref=e708]:
                    - heading "Categoria para Deletar E2E 1777226989140" [level=3] [ref=e709]
                    - generic [ref=e710]: 🟢 Ativa
                  - generic [ref=e711]:
                    - generic [ref=e712]:
                      - generic [ref=e713]: ⏱️
                      - text: "SLA: 1 horas"
                    - generic [ref=e714]:
                      - generic [ref=e715]: 🎫
                      - text: 0 tickets
                    - generic [ref=e716]: Categoria de teste E2E 1777226989806
              - generic [ref=e717]:
                - button "✏️" [ref=e718] [cursor=pointer]
                - button "⛔" [ref=e719] [cursor=pointer]
                - button "🗑️" [ref=e720] [cursor=pointer]
            - generic [ref=e722]:
              - generic [ref=e723]:
                - generic [ref=e724]: 📁
                - generic [ref=e725]:
                  - generic [ref=e726]:
                    - heading "Teste" [level=3] [ref=e727]
                    - generic [ref=e728]: 🟢 Ativa
                  - generic [ref=e729]:
                    - generic [ref=e730]:
                      - generic [ref=e731]: ⏱️
                      - text: "SLA: 1 dia"
                    - generic [ref=e732]:
                      - generic [ref=e733]: 🎫
                      - text: 1 ticket
              - generic [ref=e734]:
                - button "✏️" [ref=e735] [cursor=pointer]
                - button "⛔" [ref=e736] [cursor=pointer]
                - button "🗑️" [ref=e737] [cursor=pointer]
            - generic [ref=e739]:
              - generic [ref=e740]:
                - generic [ref=e741]: 📁
                - generic [ref=e742]:
                  - generic [ref=e743]:
                    - heading "outra" [level=3] [ref=e744]
                    - generic [ref=e745]: 🟢 Ativa
                  - generic [ref=e746]:
                    - generic [ref=e747]:
                      - generic [ref=e748]: ⏱️
                      - text: "SLA: 1 dia"
                    - generic [ref=e749]:
                      - generic [ref=e750]: 🎫
                      - text: 0 tickets
              - generic [ref=e751]:
                - button "✏️" [ref=e752] [cursor=pointer]
                - button "⛔" [ref=e753] [cursor=pointer]
                - button "🗑️" [ref=e754] [cursor=pointer]
            - generic [ref=e756]:
              - generic [ref=e757]:
                - generic [ref=e758]: 📁
                - generic [ref=e759]:
                  - generic [ref=e760]:
                    - heading "outro" [level=3] [ref=e761]
                    - generic [ref=e762]: 🟢 Ativa
                  - generic [ref=e763]:
                    - generic [ref=e764]:
                      - generic [ref=e765]: ⏱️
                      - text: "SLA: 1 dia"
                    - generic [ref=e766]:
                      - generic [ref=e767]: 🎫
                      - text: 0 tickets
                    - generic [ref=e768]: ldldl
              - generic [ref=e769]:
                - button "✏️" [ref=e770] [cursor=pointer]
                - button "⛔" [ref=e771] [cursor=pointer]
                - button "🗑️" [ref=e772] [cursor=pointer]
  - alert [ref=e773]
```

# Test source

```ts
  233 |     await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
  234 |     await expect(page.getByRole('heading', { level: 1, name: 'Base de Conhecimento' })).toBeVisible();
  235 |   });
  236 | });
  237 | 
  238 | test.describe('Superadmin Company Management', () => {
  239 |   test.beforeEach(async ({ page }) => {
  240 |     await loginAs(page, 'superadmin');
  241 |   });
  242 | 
  243 |   test('COMP-E2E-001: View companies list', async ({ page }) => {
  244 |     await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
  245 |     await expect(page.getByRole('heading', { level: 1, name: 'Gerenciar Empresas' })).toBeVisible();
  246 |   });
  247 | });
  248 | 
  249 | test.describe('Superadmin Plan Management', () => {
  250 |   test.beforeEach(async ({ page }) => {
  251 |     await loginAs(page, 'superadmin');
  252 |   });
  253 | 
  254 |   test('PLAN-E2E-001: View plans list', async ({ page }) => {
  255 |     await page.goto(`${BASE_URL}/dashboard/superadmin/planos`);
  256 |     await expect(page.getByRole('heading', { level: 1, name: 'Planos de Assinatura' })).toBeVisible();
  257 |   });
  258 | });
  259 | 
  260 | test.describe('Dashboard Access Control', () => {
  261 |   test('DASH-E2E-001: Superadmin sees Empresas and Planos', async ({ page }) => {
  262 |     await loginAs(page, 'superadmin');
  263 |     await expect(navLinkByHref(page, '/dashboard/superadmin/empresas')).toBeVisible();
  264 |     await expect(navLinkByHref(page, '/dashboard/superadmin/planos')).toBeVisible();
  265 |   });
  266 | 
  267 |   test('DASH-E2E-002: Admin sees full menu', async ({ page }) => {
  268 |     await loginAs(page, 'admin');
  269 |     await expect(navLinkByHref(page, '/dashboard/cliente/tickets')).toBeVisible();
  270 |     await expect(navLinkByHref(page, '/dashboard/atendente/tickets')).toBeVisible();
  271 |     await expect(navLinkByHref(page, '/dashboard/atendente/aprovacao')).toBeVisible();
  272 |     await expect(navLinkByHref(page, '/dashboard/admin/usuarios')).toBeVisible();
  273 |     await expect(navLinkByHref(page, '/dashboard/admin/config-ia')).toBeVisible();
  274 |     await expect(navLinkByHref(page, '/dashboard/admin/conhecimento')).toBeVisible();
  275 |   });
  276 | 
  277 |   test('DASH-E2E-003: Agent sees Tickets and Aprovar IA', async ({ page }) => {
  278 |     await loginAs(page, 'agent');
  279 |     await expect(navLinkByHref(page, '/dashboard/atendente/tickets')).toBeVisible();
  280 |     await expect(navLinkByHref(page, '/dashboard/atendente/aprovacao')).toBeVisible();
  281 |     await expect(navLinkByHref(page, '/dashboard/admin/usuarios')).toHaveCount(0);
  282 |   });
  283 | 
  284 |   test('DASH-E2E-004: Customer sees only Meus Tickets', async ({ page }) => {
  285 |     await loginAs(page, 'customer');
  286 |     await expect(navLinkByHref(page, '/dashboard/cliente/tickets')).toBeVisible();
  287 |     await expect(navLinkByHref(page, '/dashboard/atendente/tickets')).toHaveCount(0);
  288 |     await expect(navLinkByHref(page, '/dashboard/atendente/aprovacao')).toHaveCount(0);
  289 |   });
  290 | });
  291 | 
  292 | test('Health Check: API is running', async ({ page }) => {
  293 |   const response = await page.request.get(`${API_URL}/health`);
  294 |   expect(response.ok()).toBeTruthy();
  295 | });
  296 | 
  297 | // Helper para criar categoria via API
  298 | async function createCategoryViaApi(request: APIRequestContext, name: string, isActive: boolean = true) {
  299 |   const token = await apiLogin(request, 'admin');
  300 |   const response = await request.post(`${API_URL}/api/v1/categories/`, {
  301 |     headers: {
  302 |       Authorization: `Bearer ${token}`,
  303 |     },
  304 |     data: {
  305 |       name,
  306 |       description: `Categoria de teste E2E ${Date.now()}`,
  307 |       sla_minutes: 60,
  308 |       require_approval: false,
  309 |       is_active: isActive,
  310 |     },
  311 |   });
  312 |   return response;
  313 | }
  314 | 
  315 | test.describe('Admin Categories Management', () => {
  316 |   test.beforeEach(async ({ page }) => {
  317 |     await loginAs(page, 'admin');
  318 |   });
  319 | 
  320 |   test('CAT-E2E-001: View categories list', async ({ page }) => {
  321 |     await page.goto(`${BASE_URL}/dashboard/admin/categorias`);
  322 |     await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible();
  323 |     await expect(page.getByPlaceholder('Buscar categoria...')).toBeVisible();
  324 |   });
  325 | 
  326 |   test('CAT-E2E-002: Create new category via UI', async ({ page }) => {
  327 |     const categoryName = `Categoria UI E2E ${Date.now()}`;
  328 | 
  329 |     await page.goto(`${BASE_URL}/dashboard/admin/categorias`);
  330 |     await page.waitForLoadState('networkidle');
  331 | 
  332 |     // Clicar no botão Nova Categoria
> 333 |     await page.getByRole('button', { name: /nova categoria/i }).click();
      |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  334 | 
  335 |     // Esperar o modal aparecer
  336 |     await page.waitForSelector('form', { state: 'visible', timeout: 5000 });
  337 | 
  338 |     // Preencher o formulário
  339 |     await page.fill('#name', categoryName);
  340 |     await page.fill('#description', 'Descrição da categoria de teste');
  341 |     await page.fill('#sla', '120');
  342 | 
  343 |     // Submeter
  344 |     await page.getByRole('button', { name: 'Salvar' }).click();
  345 | 
  346 |     // Aguardar o modal fechar e a lista atualizar
  347 |     await page.waitForTimeout(2000);
  348 | 
  349 |     // Verificar que a categoria foi criada
  350 |     await expect(page.getByText(categoryName)).toBeVisible({ timeout: 10000 });
  351 |   });
  352 | 
  353 |   test('CAT-E2E-003: Modal form has correct fields', async ({ page }) => {
  354 |     await page.goto(`${BASE_URL}/dashboard/admin/categorias`);
  355 |     await page.waitForLoadState('networkidle');
  356 | 
  357 |     // Abrir modal
  358 |     await page.getByRole('button', { name: /nova categoria/i }).click();
  359 |     await page.waitForSelector('form', { state: 'visible', timeout: 5000 });
  360 | 
  361 |     // Verificar campos do formulário
  362 |     await expect(page.locator('#name')).toBeVisible();
  363 |     await expect(page.locator('#description')).toBeVisible();
  364 |     await expect(page.locator('#sla')).toBeVisible();
  365 |     await expect(page.locator('#require_approval')).toBeVisible();
  366 |     await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  367 |     await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible();
  368 |   });
  369 | 
  370 |   test('CAT-E2E-004: Search categories', async ({ page }) => {
  371 |     await page.goto(`${BASE_URL}/dashboard/admin/categorias`);
  372 |     await page.waitForLoadState('networkidle');
  373 | 
  374 |     // Buscar por texto
  375 |     await page.fill('input[placeholder="Buscar categoria..."]', 'Categoria');
  376 |     await page.waitForTimeout(500);
  377 | 
  378 |     // Verificar que a lista é filtrada (deve ter pelo menos um resultado)
  379 |     const rows = page.locator('.space-y-3 > div');
  380 |     await expect(rows.first()).toBeVisible();
  381 |   });
  382 | 
  383 |   test('CAT-E2E-005: Category list shows status badges', async ({ page }) => {
  384 |     await page.goto(`${BASE_URL}/dashboard/admin/categorias`);
  385 |     await page.waitForLoadState('networkidle');
  386 | 
  387 |     // Verificar que existem badges de status (Ativa ou Inativa)
  388 |     const activeCount = await page.getByText('🟢 Ativa').count();
  389 |     const inactiveCount = await page.getByText('🔴 Inativa').count();
  390 |     expect(activeCount + inactiveCount).toBeGreaterThan(0);
  391 |   });
  392 | 
  393 |   test('CAT-E2E-006: Category list shows action buttons', async ({ page }) => {
  394 |     await page.goto(`${BASE_URL}/dashboard/admin/categorias`);
  395 |     await page.waitForLoadState('networkidle');
  396 | 
  397 |     // Verificar botões de ação
  398 |     await expect(page.locator('button[title="Editar"]').first()).toBeVisible();
  399 |     await expect(page.locator('button[title="Inativar"], button[title="Ativar"]').first()).toBeVisible();
  400 |     await expect(page.locator('button[title="Excluir"]').first()).toBeVisible();
  401 |   });
  402 | });
  403 | 
  404 | test.describe('Admin AI Configuration Full', () => {
  405 |   test.beforeEach(async ({ page }) => {
  406 |     await loginAs(page, 'admin');
  407 |     await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
  408 |     await page.waitForLoadState('networkidle');
  409 |   });
  410 | 
  411 |   test('AICFG-E2E-002: View AI configuration page loads correctly', async ({ page }) => {
  412 |     // Verificar elementos principais da página
  413 |     await expect(page.getByRole('heading', { name: 'Configuração da IA' })).toBeVisible();
  414 |     await expect(page.getByRole('heading', { name: 'Chave API OpenRouter' })).toBeVisible();
  415 |     await expect(page.getByRole('heading', { name: 'Modelo de LLM' })).toBeVisible();
  416 |     await expect(page.getByRole('heading', { name: 'Ferramentas do Agente' })).toBeVisible();
  417 |     await expect(page.getByRole('heading', { name: 'Nível de Autonomia' })).toBeVisible();
  418 |   });
  419 | 
  420 |   test('AICFG-E2E-003: Change LLM model', async ({ page }) => {
  421 |     // Verificar que a página carregou
  422 |     await expect(page.getByRole('heading', { name: 'Configuração da IA' })).toBeVisible();
  423 | 
  424 |     // Encontrar o select de modelo
  425 |     const llmSelect = page.locator('#llmModel');
  426 |     await expect(llmSelect).toBeVisible();
  427 | 
  428 |     // Obter valor atual
  429 |     const currentValue = await llmSelect.inputValue();
  430 | 
  431 |     // Selecionar outro modelo
  432 |     const options = page.locator('#llmModel option');
  433 |     const count = await options.count();
```