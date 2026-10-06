# Treino Comuna+

Aplicativo Android de treino com estética de cartaz revolucionário, mascote **Camarada** e foco em constância.

## Primeira versão

- Ordem do dia automática conforme o dia da semana
- Treinos de segunda a sexta
- Modo treino com séries, repetições, carga e cronômetro de descanso
- Modo mínimo para os dias em que a energia estiver baixa
- Registro de peso e medidas corporais
- Calendário mensal com treinos concluídos
- Foto ao fim do treino usando a câmera
- Ilustrações vetoriais dos aparelhos dentro do treino
- Histórico local
- Progresso de peso, cintura e abdômen
- Mascote Camarada em toda a experiência
- Funciona sem conta e salva os dados localmente no aparelho

> O repositório não contém dados pessoais do usuário. Peso, medidas, fotos e histórico ficam no armazenamento local do aplicativo.

## Rodar o projeto

1. Instale Node.js LTS.
2. Na pasta do projeto:

    npm install

3. Depois:

    npx expo start

Use o Expo Go para testar rapidamente no Android.

## Gerar APK

### Pelo próprio GitHub

O repositório já possui o workflow **Build APK**.

1. Abra a aba **Actions** do repositório.
2. Escolha **Build APK**.
3. Clique em **Run workflow**.
4. Quando terminar, abra a execução e baixe o artefato **Treino-Comuna-Plus-APK**.

Esse build gera um APK de depuração instalável para testes.

### Pelo EAS

Também é possível gerar pelo EAS:

    npm install -g eas-cli
    eas login
    eas build:configure
    eas build -p android --profile preview

O perfil `preview` já está configurado em `eas.json` para gerar APK.

## Identidade

**Treino Comuna+**  
Mascote: **Camarada**  
Paleta: vermelho, preto, creme e amarelo industrial.

Frase-base: **DISCIPLINA VENCE A DESCULPA.**

## Privacidade

As fotos pós-treino são copiadas para o diretório local do aplicativo. Os dados não são enviados para servidor nesta versão.

## Próximos passos

A próxima versão pode incluir gráficos avançados, backup em nuvem, personalização do treino, notificações, exportação de progresso e biblioteca ilustrada de aparelhos.
