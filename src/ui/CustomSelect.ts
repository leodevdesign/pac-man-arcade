/**
 * CustomSelect: Componente de Dropdown Customizado em Roxo Glassmorphism
 * Substitui os seletores nativos para eliminar 100% do hover azul do navegador
 */
export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: string;
}

export class CustomSelect {
  private containerEl: HTMLElement;
  private selectEl: HTMLSelectElement;
  private customWrapper: HTMLElement;
  private triggerBtn: HTMLButtonElement;
  private dropdownList: HTMLElement;
  private isOpen: boolean = false;
  private onChangeCallback: ((value: string) => void) | null = null;

  constructor(selectId: string, onChange?: (value: string) => void) {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    if (!select || !select.parentElement) {
      throw new Error(`Select ${selectId} não encontrado.`);
    }

    this.selectEl = select;
    this.containerEl = select.parentElement;
    this.onChangeCallback = onChange || null;

    // Oculta o select nativo
    this.selectEl.style.display = 'none';

    // Cria a estrutura visual customizada
    this.customWrapper = document.createElement('div');
    this.customWrapper.className = 'custom-select-wrapper';

    this.triggerBtn = document.createElement('button');
    this.triggerBtn.type = 'button';
    this.triggerBtn.className = 'custom-select-trigger';

    this.dropdownList = document.createElement('div');
    this.dropdownList.className = 'custom-select-dropdown';

    this.customWrapper.appendChild(this.triggerBtn);
    this.customWrapper.appendChild(this.dropdownList);
    this.containerEl.appendChild(this.customWrapper);

    this.render();
    this.setupListeners();
  }

  public setValue(val: string) {
    this.selectEl.value = val;
    this.updateTriggerText();
    this.renderOptions();
  }

  public getValue(): string {
    return this.selectEl.value;
  }

  public render() {
    this.updateTriggerText();
    this.renderOptions();
  }

  private updateTriggerText() {
    const selectedOption = this.selectEl.options[this.selectEl.selectedIndex];
    const text = selectedOption ? selectedOption.innerText : '';
    this.triggerBtn.innerHTML = `
      <span class="custom-select-label">${text}</span>
      <span class="custom-select-arrow"></span>
    `;
  }

  private renderOptions() {
    this.dropdownList.innerHTML = '';
    const currentVal = this.selectEl.value;

    Array.from(this.selectEl.options).forEach((opt) => {
      const optionItem = document.createElement('div');
      const isSelected = opt.value === currentVal;
      optionItem.className = `custom-select-option ${isSelected ? 'selected' : ''}`;
      optionItem.dataset.value = opt.value;
      optionItem.innerText = opt.innerText;

      optionItem.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectValue(opt.value);
        this.close();
      });

      this.dropdownList.appendChild(optionItem);
    });
  }

  private selectValue(val: string) {
    this.selectEl.value = val;
    this.updateTriggerText();
    this.renderOptions();

    // Dispara evento de mudança nativo e callback
    this.selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    if (this.onChangeCallback) {
      this.onChangeCallback(val);
    }
  }

  private open() {
    // Fecha todos os outros dropdowns abertos e limpa classes
    document.querySelectorAll('.custom-select-wrapper.open').forEach((el) => {
      el.classList.remove('open');
      el.closest('.control-field')?.classList.remove('dropdown-active');
      el.closest('.info-card')?.classList.remove('dropdown-active');
    });

    this.isOpen = true;
    this.customWrapper.classList.add('open');
    this.customWrapper.closest('.control-field')?.classList.add('dropdown-active');
    this.customWrapper.closest('.info-card')?.classList.add('dropdown-active');
  }

  private close() {
    this.isOpen = false;
    this.customWrapper.classList.remove('open');
    this.customWrapper.closest('.control-field')?.classList.remove('dropdown-active');
    this.customWrapper.closest('.info-card')?.classList.remove('dropdown-active');
  }

  private toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private setupListeners() {
    this.triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!this.customWrapper.contains(e.target as Node)) {
        this.close();
      }
    });

    // Atualiza caso o select nativo seja alterado externamente
    this.selectEl.addEventListener('change', () => {
      this.updateTriggerText();
      this.renderOptions();
    });
  }
}
