"""
STEP 4 — Train the GRU model (main AI). Saves pump_health_model.pth
"""
import torch
import torch.nn as nn
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from model_pump_gru import PumpGRU

script_dir = os.path.dirname(os.path.abspath(__file__))
X = np.load(os.path.join(script_dir, "X.npy"))
y = np.load(os.path.join(script_dir, "y.npy"))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

X_train = torch.tensor(X_train, dtype=torch.float32)
y_train = torch.tensor(y_train, dtype=torch.long)
X_test = torch.tensor(X_test, dtype=torch.float32)
y_test = torch.tensor(y_test, dtype=torch.long)

model = PumpGRU(input_size=4, hidden_size=32, num_classes=3)
# Class weights to handle imbalance (Healthy/Warning rarer in long runs)
class_counts = np.bincount(y_train.numpy(), minlength=3)
weights = 1.0 / (class_counts + 1)
weights = weights / weights.sum() * 3
class_weights = torch.tensor(weights, dtype=torch.float32)
loss_fn = nn.CrossEntropyLoss(weight=class_weights)
opt = torch.optim.Adam(model.parameters(), lr=0.001)

epochs = 25
for epoch in range(epochs):
    model.train()
    pred = model(X_train)
    loss = loss_fn(pred, y_train)
    opt.zero_grad()
    loss.backward()
    opt.step()
    if (epoch + 1) % 5 == 0 or epoch == 0:
        print("Epoch", epoch + 1, "Loss", round(loss.item(), 4))

model.eval()
with torch.no_grad():
    test_pred = model(X_test)
    test_cls = torch.argmax(test_pred, dim=1).numpy()
acc = accuracy_score(y_test.numpy(), test_cls)
print("\nTest accuracy:", round(acc * 100, 2), "%")
print(classification_report(y_test.numpy(), test_cls, target_names=["Healthy", "Warning", "Fault"]))
print("Confusion matrix:\n", confusion_matrix(y_test.numpy(), test_cls))

model_path = os.path.join(script_dir, "pump_health_model.pth")
torch.save(model.state_dict(), model_path)
print("\nModel saved:", model_path)
